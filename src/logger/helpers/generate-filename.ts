/**
 * Use to generate filename
 * @param destination
 * @returns
 */
export default function generateFilename(destination: string, level?: string) {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();

  if (minutes >= 0 && minutes < 15) {
    minutes = 0;
  } else if (minutes >= 15 && minutes < 30) {
    minutes = 15;
  } else if (minutes >= 30 && minutes < 45) {
    minutes = 30;
  } else if (minutes >= 45) {
    minutes = 45;
  }

  if (!level || level === "info")
    return `${destination}.${hours}h-${minutes}m.log`;
  return `${destination}.${hours}h-${minutes}m.${level}.log`;
}
