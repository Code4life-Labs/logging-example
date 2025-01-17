import winston from "winston";
import path from "path";
import { URL } from "url";

// Impport utils
import { StringUtils } from "src/utils/string";

// Import helpers
import getSystemlog from "./helpers/get-system-log";
import mergeLogs from "./helpers/merge-logs";
import creatLogsDailyRotate from "./helpers/rotate";
import generateFilename from "./helpers/generate-filename";

// Import application configuration
import AppConfig from "src/app.config.json";

// Import types
import type { Request } from "express";

const { combine, timestamp, label, printf } = winston.format;

type ULogLever = "info" | "error" | "warn" | "debug";

type LoggerOptions = {
  rootLevel?: ULogLever;
  canLogToConsole?: boolean;
};

type ToOptions = {
  level?: ULogLever;
  format?: "json" | "string";
};

// Logs folder will place in root of the project
const LOG_ROOT = path.resolve(
  StringUtils.getSrcPath(),
  AppConfig.logRoot,
  "logs"
);

/**
 * Standardize the output format of console (string format)
 */
const stringFormat = printf((info) => {
  const systemLog = getSystemlog(info);
  let content = info.message as string;

  // If info has endpoint
  // Rebuild `content`
  // Format should be: METHOD URL - MESSAGE
  if (info.endpoint)
    content = `${(info.endpoint as any).method} ${
      (info.endpoint as any).url
    } - ${content}`;

  // If info has dao
  // Rebuild `content`
  // Format should be: METHOD SOURCE - MESSAGE
  if (info.dao) {
    content = `${(info.dao as any).method} ${
      (info.dao as any).source
    } - ${content}`;
  }

  return mergeLogs(systemLog, content);
});

/**
 * Standardize the output format of json format. In json format,
 * we don't have to process to much, just spread the object (for now)
 */
const jsonFormat = printf((info) => {
  const finalResult = {
    ...info,
    level: info.level,
    source: info.label,
    message: info.message,
    timestamp,
  };

  delete (finalResult as any).label;

  return JSON.stringify(finalResult);
});

/**
 * Create a full managed logger. You may want to
 */
export class LoggerBuilder {
  rootLevel!: string;
  canLogToConsole!: boolean;

  private _transports!: winston.transport[];
  private _transportConfigurations!: Array<any>;
  private _instance!: winston.Logger;

  static LogFilePattern = "^w+\\.(log|txt)$";
  static OtherServerityLogFilePattern =
    "^w+\\.(error|warn|debug|fatal)\\.(log|txt)$";

  /**
   * Root logger
   */
  static Logger = new LoggerBuilder()
    .to("logs")
    .to("logs.error", { level: "error" })
    .build();

  constructor(options: LoggerOptions = {}) {
    // Setup
    this.rootLevel = options.rootLevel ? options.rootLevel : "info";
    this.canLogToConsole = options.canLogToConsole
      ? options.canLogToConsole
      : true;
    this._transports = [];
    this._transportConfigurations = [];

    // Setup transport
    if (this.canLogToConsole) {
      this._transports.push(
        new winston.transports.Console({
          format: combine(
            label({ label: AppConfig.app }),
            timestamp(),
            stringFormat
          ),
        })
      );
    }
  }

  /**
   * Use to build a standard log object of `endpoint` (base on Express)
   * @param message
   * @param req
   * @param meta
   * @returns
   */
  static buildEndpointLog(message: string, req: Request, meta?: any) {
    return {
      message,
      endpoint: {
        method: req.method,
        url: req.path,
      },
      ...meta,
    };
  }

  /**
   * Use to build a standard log object of `DAO`. `DAO` can be created from multiple ORM like
   * Sequelize or Mongoose so we need to standardize to get necessary information.
   * @param message
   * @param req
   * @param meta
   * @returns
   */
  static buildDAOLog(message: string, dao: any, result?: any, meta?: any) {
    return {
      message,
      dao: {
        method: dao.method,
        source: dao.source,
        result,
      },
      ...meta,
    };
  }

  /**
   * Set root level of the logger
   * @param level
   * @returns
   */
  setRootLevel(level: ULogLever) {
    this.rootLevel = level;
    return this;
  }

  /**
   * Add more destination to the logger
   * @param destination
   * @returns
   */
  to(destination: string, options?: ToOptions) {
    const logFileRegex = new RegExp(LoggerBuilder.LogFilePattern);

    if (logFileRegex.test(destination)) {
      console.error(`Invalid name ${destination}, log file need only filename`);
      return this;
    }

    let defaultFormatFn = jsonFormat;
    let defaultLevel = "info";

    // Check if has format
    if (options && options.format && options.format === "string") {
      defaultFormatFn = stringFormat;
    }

    if (options && options.level && options.level !== "info") {
      // Check format for destination file
      defaultLevel = options.level;
    }

    const configuration = {
      level: defaultLevel,
      filename: path.resolve(
        LOG_ROOT,
        generateFilename(destination, defaultLevel)
      ),
      format: combine(
        label({ label: AppConfig.app }),
        timestamp(),
        defaultFormatFn
      ),
    };

    // Save
    this._transportConfigurations.push(configuration);
    this._transports.push(new winston.transports.File(configuration));

    return this;
  }

  /**
   * Build the final instance of winston logger
   * @returns
   */
  build() {
    this._instance = winston.createLogger({
      level: this.rootLevel,
      format: combine(label({ label: AppConfig.app }), timestamp(), jsonFormat),
      transports: this._transports,
    });

    // Create new cronjob
    const job = creatLogsDailyRotate(this._instance, this, LOG_ROOT);
    job.start();

    return this._instance;
  }

  /**
   * Use to set new update
   * @param transports
   */
  setNewTransports(transports: Array<any>) {
    // Clear transports
    this.clearTransports();

    transports.forEach((transport) => {
      this._transports.push(transport);
    });
  }

  /**
   * Use to get configurations of transports
   * @returns
   */
  getTransportConfigurations() {
    return this._transportConfigurations;
  }

  /**
   * Use to get transports
   */
  getTransports() {
    return this._transports;
  }

  /**
   * Use to clear transport
   */
  clearTransports() {
    while (this._transports.length !== 0) {
      this._transports.pop();
    }
  }
}
