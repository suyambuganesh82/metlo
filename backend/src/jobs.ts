import mlog from "logger"
import Queue, { JobId, Queue as QueueInterface } from "bull"
import kill from "tree-kill"
import schedule from "node-schedule"
import { JobName } from "services/jobs/types"
import { JOB_NAME_MAP } from "services/jobs/constants"

const defaultJobOptions = {
  removeOnFail: true,
  removeOnComplete: true,
}

const logQueueData = async (queue: QueueInterface) => {
  const jobs = await queue.getJobs([
    "active",
    "completed",
    "delayed",
    "failed",
    "paused",
    "waiting",
  ])
  for (const job of jobs) {
    const logPrefix = `Queue ${queue.name}-${job.name}-${job.id}`
    const jobState = await job.getState()
    mlog.debug(`${logPrefix} is ${jobState}:${job.failedReason ?? ""}.`)
  }
}

const clearFinishedJobs = async (queue: QueueInterface) => {
  await queue.clean(0, "completed")
  await queue.clean(0, "failed")
}

const killJob = (queue: QueueInterface, jobId: JobId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const job = await queue.getJob(jobId)

      if (!job) {
        return resolve(false)
      }

      kill(job.data.pid, "SIGTERM", err => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

const cleanQueue = async (queue: QueueInterface, graceMillis?: number) => {
  const gracePeriod = graceMillis ?? 0
  await queue.clean(gracePeriod, "active")
  await queue.clean(gracePeriod, "completed")
  await queue.clean(gracePeriod, "delayed")
  await queue.clean(gracePeriod, "failed")
  await queue.clean(gracePeriod, "paused")
  await queue.clean(gracePeriod, "wait")
}

const createQueue = (jobName: JobName) => {
  const queue = new Queue(`${jobName}_queue`, process.env.REDIS_URL, {
    defaultJobOptions,
  })
  queue.process(`${jobName}`, __dirname + "/services/jobs/processor.js")
  return queue
}

const main = async () => {
  const specQueue = createQueue(JobName.GENERATE_OPENAPI_SPEC)
  const logAggregatedStatsQueue = createQueue(JobName.LOG_AGGREGATED_STATS)
  const fixEndpointsQueue = createQueue(JobName.FIX_ENDPOINTS)
  const detectSensitiveDataQueue = createQueue(JobName.DETECT_SENSITIVE_DATA)
  const detectPrivateIPQueue = createQueue(JobName.DETECT_PRIVATE_HOSTS)
  const updateHourlyTraceAggregate = createQueue(
    JobName.UPDATE_HOURLY_TRACE_AGG,
  )

  const queues: QueueInterface[] = [
    specQueue,
    logAggregatedStatsQueue,
    fixEndpointsQueue,
    detectSensitiveDataQueue,
    detectPrivateIPQueue,
    updateHourlyTraceAggregate,
  ]

  schedule.scheduleJob("*/60 * * * *", async () => {
    await specQueue.add(
      `${JobName.GENERATE_OPENAPI_SPEC}`,
      {},
      { ...defaultJobOptions, jobId: JobName.GENERATE_OPENAPI_SPEC },
    )
  })

  if ((process.env.DISABLE_LOGGING_STATS || "false").toLowerCase() == "false") {
    schedule.scheduleJob("0 */6 * * *", async () => {
      await logAggregatedStatsQueue.add(
        `${JobName.LOG_AGGREGATED_STATS}`,
        {},
        { ...defaultJobOptions, jobId: JobName.LOG_AGGREGATED_STATS },
      )
    })
  } else {
    mlog.info("Logging Aggregated Stats Disabled...")
  }

  schedule.scheduleJob("*/60 * * * *", async () => {
    await fixEndpointsQueue.add(
      `${JobName.FIX_ENDPOINTS}`,
      {},
      { ...defaultJobOptions, jobId: JobName.FIX_ENDPOINTS },
    )
  })

  schedule.scheduleJob("*/15 * * * *", async () => {
    await detectSensitiveDataQueue.add(
      `${JobName.DETECT_SENSITIVE_DATA}`,
      {},
      { ...defaultJobOptions, jobId: JobName.DETECT_SENSITIVE_DATA },
    )
  })

  schedule.scheduleJob("0 */1 * * *", async () => {
    await detectPrivateIPQueue.add(
      `${JobName.DETECT_PRIVATE_HOSTS}`,
      {},
      { ...defaultJobOptions, jobId: JobName.DETECT_PRIVATE_HOSTS },
    )
  })

  schedule.scheduleJob("*/5 * * * *", async () => {
    await updateHourlyTraceAggregate.add(
      `${JobName.UPDATE_HOURLY_TRACE_AGG}`,
      {},
      { ...defaultJobOptions, jobId: JobName.UPDATE_HOURLY_TRACE_AGG },
    )
  })

  schedule.scheduleJob("* * * * *", async () => {
    for (const queue of queues) {
      await logQueueData(queue)
      await clearFinishedJobs(queue)
      const activeJobs = await queue.getActive()
      for (const job of activeJobs) {
        if (job) {
          const threshold = JOB_NAME_MAP[job.name as JobName].threshold
          if (Date.now() - job?.timestamp > threshold) {
            mlog.error(
              `Job ${job.name} taking too long, exceeded threshold of ${threshold} ms. Killing job with pid ${job.data?.pid}.`,
              true,
            )
            await killJob(queue, job.id)
          }
        }
      }
    }
  })

  process.on("SIGINT", () => {
    schedule.gracefulShutdown().then(async () => {
      mlog.info("Stopping all queues and jobs...")
      for (const queue of queues) {
        const activeJobs = await queue.getActive()
        for (const job of activeJobs) {
          await killJob(queue, job.id)
        }
        await cleanQueue(queue)
        await queue.close()
      }
      process.exit(0)
    })
  })

  process.on("SIGTERM", () => {
    schedule.gracefulShutdown().then(async () => {
      mlog.info("Stopping all queues and jobs...")
      for (const queue of queues) {
        const activeJobs = await queue.getActive()
        for (const job of activeJobs) {
          await killJob(queue, job.id)
        }
        await cleanQueue(queue)
        await queue.close()
      }
      process.exit(0)
    })
  })
}

main()
