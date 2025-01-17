import express from "express";
import http from "http";
import cors from "cors";

// Use module-alias
import "module-alias/register";

// Import config
import AppConfig from "src/app.config.json";

// Import endpoints
import buildEndpoints from "src/endpoints";

// Import logger builder
import { LoggerBuilder } from "./logger";

const profiler = LoggerBuilder.Logger.startTimer();

// Start log
profiler.logger.info("Initialize application");

const app = express();
const router = express.Router();

// Add global middleware
app.use(
  cors({
    origin: AppConfig.origins,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

profiler.logger.info("Setup gloabal middlewares done");

// Apply router
app.use(router);

async function main() {
  try {
    // Setup server instance
    const instance = http.createServer(app);

    // Build endpoints
    const endpoints = await buildEndpoints(router);

    profiler.logger.info("Build endpoints done");

    // Start listen
    instance.listen(AppConfig.port, AppConfig.hostname, async () => {
      // Done
      profiler.done({
        message:
          "Initialize application successfully, now it readies and opens to receive request.",
      });

      for (const endpoint of endpoints) {
        console.table(endpoint);
      }

      console.log(
        `You server is listening on http://${AppConfig.hostname}:${AppConfig.port}`
      );
    });
  } catch (error: any) {
    // Catch ERROR
    profiler.logger.error(error.message);
    console.log("Exit");
    process.exit(1);
  }
}

main();
