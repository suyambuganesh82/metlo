import { v4 as uuidv4 } from "uuid"
import { AppDataSource } from "data-source"
import { ApiTrace, ApiEndpoint, DataField, Alert } from "models"
import { DataFieldService } from "services/data-field"
import { SpecService } from "services/spec"
import { AlertService } from "services/alert"
import { DatabaseService } from "services/database"
import { RedisClient } from "utils/redis"
import { TRACES_QUEUE } from "~/constants"
import { QueryRunner, Raw } from "typeorm"
import { QueuedApiTrace } from "@common/types"
import { isSuspectedParamater, skipAutoGeneratedMatch } from "utils"
import { getPathTokens } from "@common/utils"
import { AlertType } from "@common/enums"

const getQueuedApiTrace = async (): Promise<QueuedApiTrace> => {
  try {
    const traceString = await RedisClient.popValueFromRedisList(TRACES_QUEUE)
    return JSON.parse(traceString)
  } catch (err) {
    return null
  }
}

const analyze = async (
  trace: QueuedApiTrace,
  apiEndpoint: ApiEndpoint,
  queryRunner: QueryRunner,
  newEndpoint?: boolean,
) => {
  apiEndpoint.updateDates(trace.createdAt)
  const dataFields = DataFieldService.findAllDataFields(trace, apiEndpoint)
  let alerts = await SpecService.findOpenApiSpecDiff(
    trace,
    apiEndpoint,
    queryRunner,
  )
  const sensitiveDataAlerts = await AlertService.createDataFieldAlerts(
    dataFields,
    apiEndpoint.uuid,
    apiEndpoint.path,
    trace,
    queryRunner,
  )
  alerts = alerts?.concat(sensitiveDataAlerts)
  if (newEndpoint) {
    const newEndpointAlert = await AlertService.createAlert(
      AlertType.NEW_ENDPOINT,
      apiEndpoint,
    )
    alerts = alerts?.concat(newEndpointAlert)
  }

  await queryRunner.startTransaction()
  await DatabaseService.retryTypeormTransaction(
    () =>
      queryRunner.manager.insert(ApiTrace, {
        ...trace,
        apiEndpointUuid: apiEndpoint.uuid,
      }),
    5,
  )
  await DatabaseService.retryTypeormTransaction(
    () =>
      queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(DataField)
        .values(dataFields)
        .orUpdate(
          [
            "dataClasses",
            "scannerIdentified",
            "dataType",
            "dataTag",
            "matches",
          ],
          ["dataSection", "dataPath", "apiEndpointUuid"],
        )
        .execute(),
    5,
  )
  await DatabaseService.retryTypeormTransaction(
    () =>
      queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Alert)
        .values(alerts)
        .orIgnore()
        .execute(),
    5,
  )
  await DatabaseService.retryTypeormTransaction(
    () =>
      queryRunner.manager
        .createQueryBuilder()
        .update(ApiEndpoint)
        .set({
          firstDetected: apiEndpoint.firstDetected,
          lastActive: apiEndpoint.lastActive,
          riskScore: apiEndpoint.riskScore,
        })
        .where("uuid = :id", { id: apiEndpoint.uuid })
        .execute(),
    5,
  )
  await queryRunner.commitTransaction()
}

const generateEndpoint = async (
  trace: QueuedApiTrace,
  queryRunner: QueryRunner,
): Promise<void> => {
  const pathTokens = getPathTokens(trace.path)
  let paramNum = 1
  let parameterizedPath = ""
  let pathRegex = String.raw``
  for (let j = 0; j < pathTokens.length; j++) {
    const tokenString = pathTokens[j]
    if (tokenString === "/") {
      parameterizedPath += "/"
      pathRegex += "/"
    } else if (tokenString.length > 0) {
      if (isSuspectedParamater(tokenString)) {
        parameterizedPath += `/{param${paramNum}}`
        pathRegex += String.raw`/[^/]+`
        paramNum += 1
      } else {
        parameterizedPath += `/${tokenString}`
        pathRegex += String.raw`/${tokenString}`
      }
    }
  }
  if (pathRegex.length > 0) {
    pathRegex = String.raw`^${pathRegex}(/)*$`
    const apiEndpoint = new ApiEndpoint()
    apiEndpoint.uuid = uuidv4()
    apiEndpoint.path = parameterizedPath
    apiEndpoint.pathRegex = pathRegex
    apiEndpoint.host = trace.host
    apiEndpoint.method = trace.method
    apiEndpoint.addNumberParams()
    apiEndpoint.dataFields = []

    try {
      await queryRunner.startTransaction()
      await DatabaseService.retryTypeormTransaction(
        () =>
          queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(ApiEndpoint)
            .values(apiEndpoint)
            .execute(),
        5,
      )
      await queryRunner.commitTransaction()
      await analyze(trace, apiEndpoint, queryRunner, true)
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction()
      }
      if (DatabaseService.isQueryFailedError(err) && err.code === "23505") {
        const existingEndpoint = await queryRunner.manager.findOne(
          ApiEndpoint,
          {
            where: {
              path: trace.path,
              host: trace.host,
              method: trace.method,
            },
            relations: { dataFields: true },
          },
        )
        if (existingEndpoint) {
          await analyze(trace, existingEndpoint, queryRunner)
        }
      } else {
        console.error(`Error generating new endpoint: ${err}`)
        await queryRunner.rollbackTransaction()
      }
    }
  }
}

const analyzeTraces = async (): Promise<void> => {
  const datasource = await AppDataSource.initialize()
  if (!datasource.isInitialized) {
    console.error("Couldn't initialize datasource...")
    return
  }
  console.log("AppDataSource Initialized...")
  console.log("Running Analyzer...")
  let queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()
  while (true) {
    try {
      const trace = await getQueuedApiTrace()
      if (trace) {
        trace.createdAt = new Date(trace.createdAt)
        const apiEndpoint = await queryRunner.manager.findOne(ApiEndpoint, {
          where: {
            pathRegex: Raw(alias => `:path ~ ${alias}`, { path: trace.path }),
            method: trace.method,
            host: trace.host,
          },
          relations: { openapiSpec: true, dataFields: true },
          order: {
            numberParams: "ASC",
          },
        })
        if (apiEndpoint && !skipAutoGeneratedMatch(apiEndpoint, trace.path)) {
          await analyze(trace, apiEndpoint, queryRunner)
        } else {
          await generateEndpoint(trace, queryRunner)
        }
      }
    } catch (err) {
      console.error(`Encountered error while analyzing traces: ${err}`)
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction()
      }
    } finally {
      if (queryRunner.isReleased) {
        queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
      }
    }
  }
}

export default analyzeTraces
