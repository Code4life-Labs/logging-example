import path from "path";
import winston from "winston";
import { CronJob } from "cron";

// Import helpers
import generateFilename from "./generate-filename";

// Import types
import type { LoggerBuilder } from "..";

/**
 * Use to create standard log daily rotate
 * @param logger
 * @returns
 */
export default function creatLogsDailyRotate(
  logger: winston.Logger,
  loggerBuilder: LoggerBuilder,
  logRoot: string
) {
  // Each 5 minutes create new files
  return new CronJob("*/15 * * * *", function () {
    const transportConfigurations = loggerBuilder.getTransportConfigurations();
    const N = transportConfigurations.length;

    // Clear
    logger.clear();

    for (let i = 0; i < N; i++) {
      const [filename] = transportConfigurations[i].filename.split(".");
      transportConfigurations[i].filename = path.resolve(
        logRoot,
        generateFilename(filename, transportConfigurations[i].level)
      );

      logger.add(new winston.transports.File(transportConfigurations[i]));
    }
  });
}
