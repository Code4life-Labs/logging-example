// Import classes
import { Endpoints } from "src/classes/Endpoints";

// Import DAO
import { getTasks } from "src/databases/task";

// Import logger
import { LoggerBuilder } from "src/logger";

const _rootEndpoints = new Endpoints("");
const logger = new LoggerBuilder()
  .to("root-endpoints")
  .to("root-endpoints", { format: "string", level: "error" })
  .build();

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
  const profiler = logger.startTimer();
  const result = getTasks(req);

  if (!result) {
    o.code = 500;
    profiler.logger.error(
      LoggerBuilder.buildEndpointLog("Cannot get tasks", req)
    );
    throw new Error("Cannot get tasks");
  }

  profiler.done(LoggerBuilder.buildEndpointLog("Get tasks", req));

  return result;
});

export default _rootEndpoints;
