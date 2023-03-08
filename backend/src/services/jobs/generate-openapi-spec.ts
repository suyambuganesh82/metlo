import mlog from "logger"
import { Brackets } from "typeorm"
import { DataSection, DataType, SpecExtension } from "@common/enums"
import { ApiEndpoint, OpenApiSpec, DataField } from "models"
import { getEntityManager, getQB } from "services/database/utils"
import { MetloContext } from "types"
import { AppDataSource } from "data-source"

const replacer = (key, value) => {
  if (value instanceof Map) {
    return Object.fromEntries(value)
  } else {
    return value
  }
}

const addArrayToSchema = (schema: Map<string, any>) => {
  schema.delete("nullable")
  schema.delete("properties")
  if (!schema.get("items")) {
    schema.set("type", DataType.ARRAY)
    schema.set("items", new Map<string, any>())
  }
  schema = schema.get("items")
  return schema
}

const addLeafToSchema = (
  schema: Map<string, any>,
  dataType: DataType,
  isNullable: boolean,
  name?: string,
) => {
  if (dataType === DataType.UNKNOWN) {
    if (name) {
      if (!schema.get(name)) {
        schema.set(name, new Map<string, any>())
      }
      schema = schema.get(name)
    }
    schema.delete("properties")
    schema.delete("items")
    schema.set("nullable", true)
  } else {
    if (name) {
      if (!schema.get(name)) {
        schema.set(name, new Map<string, any>())
      }
      schema = schema.get(name)
    }
    schema.delete("properties")
    schema.delete("items")
    if (isNullable) {
      schema.set("nullable", true)
    }
    schema.set("type", dataType)
  }
}

const addObjectToSchema = (schema: Map<string, any>, name?: string) => {
  schema.delete("items")
  schema.delete("nullable")
  if (!schema.get("properties")) {
    schema.set("type", DataType.OBJECT)
    schema.set("properties", new Map<string, any>())
  }
  schema = schema.get("properties")
  if (name) {
    if (!schema.get(name)) {
      schema.set(name, new Map<string, any>())
    }
    schema = schema.get(name)
  }
  return schema
}

const addPatternObjectToSchema = (schema: Map<string, any>) => {
  schema.delete("items")
  schema.delete("nullable")
  if (!schema.get("patternProperties")) {
    schema.set("type", DataType.OBJECT)
    schema.set(
      "patternProperties",
      new Map<string, any>([["^.+$", new Map<string, any>()]]),
    )
  }
  schema = schema.get("patternProperties").get("^.+$")
  return schema
}

const addPairObjectDataFieldToSchema = (
  schema: Map<string, any>,
  dataField: DataField,
  mapTokens: string[],
  pairObjectKey: string,
) => {
  if (!schema.get(pairObjectKey)) {
    schema.set(pairObjectKey, new Map<string, any>())
  }
  schema = schema.get(pairObjectKey)
  addDataFieldToSchema(schema, dataField, mapTokens)
}

const addBodyDataFieldToSchema = (
  schema: Map<string, any>,
  dataField: DataField,
  mapTokens: string[],
  contentType: string,
) => {
  if (!schema.get(contentType)) {
    schema.set(
      contentType,
      new Map<string, any>([["schema", new Map<string, any>()]]),
    )
  }
  schema = schema.get(contentType).get("schema")
  addDataFieldToSchema(schema, dataField, mapTokens)
}

const addDataFieldToSchema = (
  schema: Map<string, any>,
  dataField: DataField,
  mapTokens: string[],
) => {
  let curr = schema
  if (mapTokens.length === 0 || mapTokens[0]?.length === 0) {
    addLeafToSchema(curr, dataField.dataType, dataField.isNullable)
    return
  }
  const l = mapTokens.length
  for (let i = 0; i < l; i++) {
    const name = mapTokens[i]
    if (i === l - 1) {
      if (name === "[]") {
        curr = addArrayToSchema(curr)
        addLeafToSchema(curr, dataField.dataType, dataField.isNullable)
      } else if (name === "[string]") {
        curr = addPatternObjectToSchema(curr)
        addLeafToSchema(curr, dataField.dataType, dataField.isNullable)
      } else {
        curr = addObjectToSchema(curr)
        addLeafToSchema(curr, dataField.dataType, dataField.isNullable, name)
      }
    } else {
      if (name === "[]") {
        curr = addArrayToSchema(curr)
      } else if (name === "[string]") {
        curr = addPatternObjectToSchema(curr)
      } else {
        curr = addObjectToSchema(curr, name)
      }
    }
  }
}

const generateSchemas = (dataFields: DataField[]) => {
  let specParameterList = []
  let reqBodySchema = new Map<string, any>()
  let responses = {}
  let reqHeaderSchema = new Map<string, any>()
  let reqQuerySchema = new Map<string, any>()

  for (const dataField of dataFields) {
    const responseStatus = dataField?.statusCode?.toString()
    let mapTokens = dataField.dataPath?.split(".")
    const contentType = dataField.contentType
    if (dataField.dataSection === DataSection.REQUEST_PATH) {
      specParameterList.push({
        name: dataField.dataPath,
        in: "path",
        schema: {
          type: dataField.dataType,
        },
        required: true,
      })
    } else if (dataField.dataSection === DataSection.REQUEST_HEADER) {
      if (mapTokens[0]?.length > 0) {
        addPairObjectDataFieldToSchema(
          reqHeaderSchema,
          dataField,
          mapTokens.slice(1),
          mapTokens[0],
        )
      }
    } else if (dataField.dataSection === DataSection.REQUEST_QUERY) {
      if (mapTokens[0]?.length > 0) {
        addPairObjectDataFieldToSchema(
          reqQuerySchema,
          dataField,
          mapTokens.slice(1),
          mapTokens[0],
        )
      }
    } else if (dataField.dataSection === DataSection.REQUEST_BODY) {
      mapTokens = mapTokens ?? [""]
      if (contentType) {
        addBodyDataFieldToSchema(
          reqBodySchema,
          dataField,
          mapTokens,
          contentType,
        )
      }
    } else if (dataField.dataSection === DataSection.RESPONSE_HEADER) {
      if (mapTokens[0]?.length > 0 && responseStatus) {
        if (!responses[responseStatus]?.headers) {
          responses[responseStatus] = {
            description: `${responseStatus} description`,
            ...responses[responseStatus],
            headers: new Map<string, any>(),
          }
        }
        addBodyDataFieldToSchema(
          responses[responseStatus].headers,
          dataField,
          mapTokens.slice(1),
          mapTokens[0],
        )
      }
    } else if (dataField.dataSection === DataSection.RESPONSE_BODY) {
      mapTokens = mapTokens ?? [""]
      if (contentType && responseStatus) {
        if (!responses[responseStatus]?.content) {
          responses[responseStatus] = {
            description: `${responseStatus} description`,
            ...responses[responseStatus],
            content: new Map<string, any>(),
          }
        }
        addBodyDataFieldToSchema(
          responses[responseStatus].content,
          dataField,
          mapTokens,
          contentType,
        )
      }
    }
  }

  return {
    specParameterList,
    reqHeaderSchema,
    reqQuerySchema,
    reqBodySchema,
    responses,
  }
}

const generateOpenApiSpec = async (ctx: MetloContext): Promise<boolean> => {
  const queryRunner = AppDataSource.createQueryRunner()
  try {
    await queryRunner.connect()
    const endpointsToUpdate: ApiEndpoint[] = await getQB(ctx, queryRunner)
      .select(["uuid", "host", "path", "method"])
      .from(ApiEndpoint, "endpoint")
      .leftJoin(`endpoint.openapiSpec`, "spec")
      .andWhere(
        new Brackets(qb => {
          qb.where(`endpoint."openapiSpecName" IS NULL`).orWhere(
            `spec."isAutoGenerated" = True`,
          )
        }),
      )
      .andWhere(`endpoint."isGraphQl" = False`)
      .getRawMany()

    const currTime = new Date()
    const hostMap: Record<string, ApiEndpoint[]> = {}
    const specIntro = {
      openapi: "3.1.0",
      info: {
        title: "OpenAPI 3.1 Spec",
        version: "1.0.0",
        description: "An auto-generated OpenAPI 3.1 specification.",
      },
    }

    for (let i = 0; i < endpointsToUpdate.length; i++) {
      const endpoint = endpointsToUpdate[i]
      if (hostMap[endpoint.host]) {
        hostMap[endpoint.host].push(endpoint)
      } else {
        hostMap[endpoint.host] = [endpoint]
      }
    }

    for (const host in hostMap) {
      let spec = await getEntityManager(ctx, queryRunner).findOneBy(
        OpenApiSpec,
        {
          name: `${host}-generated`,
          isAutoGenerated: true,
        },
      )
      if (!spec) {
        spec = new OpenApiSpec()
        spec.name = `${host}-generated`
        spec.isAutoGenerated = true
      }
      spec.hosts = [host]
      let openApiSpec = {
        ...specIntro,
        servers: [
          {
            url: `https://${host}`,
          },
        ],
        paths: {},
      }
      const endpoints = hostMap[host]
      const paths = openApiSpec["paths"]
      const endpointIds = []
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i]
        const dataFields: DataField[] = await getQB(ctx, queryRunner)
          .from(DataField, "data_field")
          .andWhere(`"apiEndpointUuid" = :endpointId`, {
            endpointId: endpoint.uuid,
          })
          .orderBy(`"updatedAt"`, "ASC")
          .getRawMany()
        const path = endpoint.path
        const method = endpoint.method.toLowerCase()

        paths[path] = {
          ...paths[path],
          [method]: {},
        }

        const {
          specParameterList,
          reqHeaderSchema,
          reqQuerySchema,
          reqBodySchema,
          responses,
        } = generateSchemas(dataFields)

        for (const [parameter, schema] of reqQuerySchema) {
          specParameterList.push({
            name: parameter,
            in: "query",
            schema: schema,
          })
        }
        for (const [parameter, schema] of reqHeaderSchema) {
          specParameterList.push({
            name: parameter,
            in: "header",
            schema: schema,
          })
        }
        if (specParameterList.length > 0) {
          paths[path][method]["parameters"] = specParameterList
        }
        if (reqBodySchema.size > 0) {
          paths[path][method]["requestBody"] = {
            content: {
              ...Object.fromEntries(reqBodySchema),
            },
          }
        }
        if (Object.keys(responses).length > 0) {
          paths[path][method]["responses"] = { ...responses }
        } else {
          delete paths[path][method]
          if (Object.keys(paths[path]).length === 0) {
            delete paths[path]
          }
        }

        if (paths[path]?.[method]) {
          endpointIds.push(endpoint.uuid)
        }
      }
      spec.spec = JSON.stringify(openApiSpec, replacer, 2)
      spec.extension = SpecExtension.JSON
      if (!spec.createdAt) {
        spec.createdAt = currTime
      }
      spec.updatedAt = currTime
      spec.specUpdatedAt = currTime

      await queryRunner.startTransaction()
      await getEntityManager(ctx, queryRunner).save(spec)
      if (endpointIds?.length > 0) {
        await getQB(ctx, queryRunner)
          .update(ApiEndpoint)
          .set({ openapiSpecName: spec.name })
          .andWhere("uuid IN(:...ids)", { ids: endpointIds })
          .execute()
      }
      await queryRunner.commitTransaction()
    }
    return true
  } catch (err) {
    mlog.withErr(err).error("Encountered error while generating OpenAPI specs")
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction()
    }
    return false
  } finally {
    await queryRunner.release()
  }
}

export default generateOpenApiSpec
