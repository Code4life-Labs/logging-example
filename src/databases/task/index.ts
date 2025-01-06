// Import logger
import { LoggerBuilder } from "src/logger";

// Import utils
import { RequestUtils } from "src/utils/request";
import { NumberUtils } from "src/utils/number";

const logger = new LoggerBuilder()
  .to("task-dao")
  .to("task-dao", { format: "string", level: "error" })
  .build();

const _dao = {
  source: "mongoose",
};

const MAX_LIMIT = 100;
const COUNT = 1e6;

export function getTasks(req: any) {
  const dao = {
    method: "getTasks",
    ..._dao,
  };
  const profiler = logger.startTimer();

  try {
    if (!req) {
      throw new Error("Request is required");
    }

    const { limit, skip } = RequestUtils.getLimitNSkip(req);
    const result = [];
    const N = skip + limit;

    // If limit is 0
    if (limit === 0) {
      throw new Error("Limit quantity of task cannot be 0");
    }

    // If limit exceeds MAX_LIMIT
    if (limit > MAX_LIMIT) {
      throw new Error(`Limit exceeds MAX_LIMIT. Limit is ${limit}`);
    }

    // If skip + limit exceed COUNT
    if (skip + limit > COUNT) {
      throw new Error(
        `Skip + limit exceeds COUNT. Total of skip & limit is ${skip + limit}`
      );
    }

    profiler.logger.info(
      LoggerBuilder.buildDAOLog("Request to MongoDB server", dao)
    );

    for (let i = skip; i <= N; i++) {
      const taskId = NumberUtils.getRandom(limit, limit + skip);

      result.push({
        id: `task-${taskId}`,
        userId: `user-${NumberUtils.getRandom(0, 1000)}`,
        content: `This is task ${taskId}`,
      });
    }

    // End of task
    profiler.done(
      LoggerBuilder.buildDAOLog(`Return task from ${skip} to ${N}`, dao)
    );

    return result;
  } catch (error: any) {
    logger.error(LoggerBuilder.buildDAOLog(error.message, dao));
    return null;
  }
}
