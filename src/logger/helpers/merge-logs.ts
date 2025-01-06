/**
 * Use to merge system log and content. Format of log must be `string`
 * @param systemLog
 * @param body
 */
export default function mergeLogs(systemLog: string, content: string) {
  return `${systemLog}: ${content}`;
}
