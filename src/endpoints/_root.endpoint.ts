// Import classes
import { Endpoints } from "src/classes/Endpoints";

// Import logger
import { LoggerBuilder } from "src/logger";

const _rootEndpoints = new Endpoints("");
const logger = new LoggerBuilder().to("root-endpoints").build();

// Add handler
_rootEndpoints.createHandler("/").get((req, res) => {
  logger.info("Root endpoint hit", { method: req.method, url: req.url });
  return "Welcome to `NodeTS auto-built template`";
});

export default _rootEndpoints;
