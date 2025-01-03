import winston from "winston";
import path from "path";

// Impport utils
import { StringUtils } from "src/utils/string";

// Import application configuration
import AppConfig from "src/app.config.json";

const { combine, timestamp, label, printf } = winston.format;

type ULogLever = "info" | "error" | "warn" | "debug" | "fatal";

type LoggerOptions = {
  rootLevel?: ULogLever;
  canLogToConsole?: boolean;
};

// Logs folder will place in root of the project
const LOG_ROOT = path.resolve(
  StringUtils.getSrcPath(),
  AppConfig.logRoot,
  "logs"
);

/**
 * Standardize the output format of console
 */
const consoleFormat = printf((info) => {
  return `${info.timestamp} [${info.level}] ${info.label}: ${info.message}`;
});

/**
 * Standardize the output format of json format
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

  static LogFilePattern = "^w+\\.(log|txt)$";

  constructor(options: LoggerOptions = {}) {
    // Setup
    this.rootLevel = options.rootLevel ? options.rootLevel : "info";
    this.canLogToConsole = options.canLogToConsole
      ? options.canLogToConsole
      : true;
    this._transports = [];

    // Setup transport
    if (this.canLogToConsole) {
      this._transports.push(
        new winston.transports.Console({
          format: combine(
            label({ label: AppConfig.app }),
            timestamp(),
            consoleFormat
          ),
        })
      );
    }
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
  to(destination: string) {
    const regex = new RegExp(LoggerBuilder.LogFilePattern);
    const destinationFile = regex.test(destination)
      ? destination
      : `${destination}.log`;

    this._transports.push(
      new winston.transports.File({
        filename: path.resolve(LOG_ROOT, destinationFile),
        format: combine(
          label({ label: AppConfig.app }),
          timestamp(),
          jsonFormat
        ),
      })
    );
    return this;
  }

  /**
   * Build the final instance of winston logger
   * @returns
   */
  build() {
    return winston.createLogger({
      level: this.rootLevel,
      format: combine(label({ label: AppConfig.app }), timestamp(), jsonFormat),
      transports: this._transports,
    });
  }
}
