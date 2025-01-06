// Import utils
import { BooleanUtils } from "src/utils/boolean";

/**
 * Use to get "header" of log (System log). Format of log must be `string`
 * @param info
 * @returns
 */
export default function getSystemlog(info: any) {
  if (!BooleanUtils.isEmpty(info.durationMs))
    return `${info.timestamp} [${info.level}] [${info.durationMs}ms] ${info.label}`;
  return `${info.timestamp} [${info.level}] ${info.label}`;
}
