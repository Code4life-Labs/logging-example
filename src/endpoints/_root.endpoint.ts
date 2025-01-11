// Import classes
import { Endpoints } from "src/classes/Endpoints";

// Import DAO
import { getTasks, getTask } from "src/databases/task";

// Import logger
import { LoggerBuilder } from "src/logger";

const _rootEndpoints = new Endpoints("");
const logger = new LoggerBuilder().to("root-endpoints").build();

// Add handler
/**
 * Get information of application
 */
_rootEndpoints.createHandler("/").get((req, res) => {
  const profiler = logger.startTimer();
  profiler.done(
    LoggerBuilder.buildEndpointLog("Get information of application", req)
  );
  return "Welcome to `NodeTS auto-built template`";
});

/**
 * Get tasks
 */
_rootEndpoints.createHandler("/tasks").get((req, res, o) => {
  // Start log
  const profiler = logger.startTimer();
  profiler.logger.info(LoggerBuilder.buildEndpointLog("Start executing", req));

  const result = getTasks(req, profiler.logger);

  if (!result) {
    o.code = 500;
    profiler.logger.error(
      LoggerBuilder.buildEndpointLog("Cannot get tasks", req)
    );
    throw new Error("Cannot get tasks");
  }

  profiler.done(LoggerBuilder.buildEndpointLog("Get tasks completely", req));

  return result;
});

/**
 * Get task by id
 */
_rootEndpoints.createHandler("/tasks/:id").get((req, res, o) => {
  // Start log
  const profiler = logger.startTimer();
  profiler.logger.info(LoggerBuilder.buildEndpointLog("Start executing", req));

  const result = getTask(req, profiler.logger);

  if (!result) {
    o.code = 500;
    profiler.logger.error(
      LoggerBuilder.buildEndpointLog("Cannot get task", req)
    );
    throw new Error("Cannot get task");
  }

  profiler.done(LoggerBuilder.buildEndpointLog("Get task completely", req));

  return result;
});

export default _rootEndpoints;
