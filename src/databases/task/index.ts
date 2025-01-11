import winston from "winston";

// Import logger
import { LoggerBuilder } from "src/logger";

// Import utils
import { RequestUtils } from "src/utils/request";
import { NumberUtils } from "src/utils/number";

const _dao = {
  source: "mongoose",
};

const MAX_LIMIT = 100;
const COUNT = 1e6;

const _tasks: Array<any> = [];
const _N = 1000;

for (let i = 0; i < _N; i++) {
  const taskId = NumberUtils.getRandom(0, _N);

  _tasks.push({
    id: `${taskId}`,
    userId: `user-${NumberUtils.getRandom(0, 1000)}`,
    content: `This is task ${taskId}`,
  });
}

export function getTask(req: any, logger: winston.Logger) {
  const dao = {
    method: "getTasks",
    ..._dao,
  };

  try {
    if (!req) {
      throw new Error("Request is required");
    }

    const taskId = req.params.id;

    // If taskId is null
    if (!taskId) {
      throw new Error("Id of task is required");
    }

    logger.info(LoggerBuilder.buildDAOLog("Request to MongoDB server", dao));

    const task = _tasks.find((task) => task.id === taskId);

    if (!task) {
      throw new Error(`Task with id ${taskId} is not found`);
    }

    // End of task
    logger.info(LoggerBuilder.buildDAOLog(`Found task ${taskId}`, dao));

    return task;
  } catch (error: any) {
    logger.error(LoggerBuilder.buildDAOLog(error.message, dao));
    return null;
  }
}

export function getTasks(req: any, logger: winston.Logger) {
  const dao = {
    method: "getTasks",
    ..._dao,
  };

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

    logger.info(LoggerBuilder.buildDAOLog("Request to MongoDB server", dao));

    for (let i = skip; i <= N; i++) {
      result.push(_tasks[i]);
    }

    // End of task
    logger.info(
      LoggerBuilder.buildDAOLog(`Return task from ${skip} to ${N}`, dao)
    );

    return result;
  } catch (error: any) {
    logger.error(LoggerBuilder.buildDAOLog(error.message, dao));
    return null;
  }
}
