/**
 * Use to generate filename
 * @param destination
 * @returns
 */
export default function generateFilename(destination: string, level?: string) {
  if (!level || level === "info") return `${destination}.${Date.now()}.log`;
  return `${destination}.${Date.now()}.${level}.log`;
}
