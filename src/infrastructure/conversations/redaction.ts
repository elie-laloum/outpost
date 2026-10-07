import type { ObservationHub } from "../../domain/observation.types.ts";

export function redactTranscript(
  text: string,
  observation?: ObservationHub,
): string {
  if (!observation?.redacting) return text;
  return text
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      try {
        const value: unknown = JSON.parse(line);
        return JSON.stringify(observation.redact(value));
      } catch {
        return observation.redact(line);
      }
    })
    .join("\n");
}

export function redactBundle(
  text: string,
  observation?: ObservationHub,
): string {
  if (!observation?.redacting) return text;
  const value: unknown = JSON.parse(text);
  if (
    !value ||
    typeof value !== "object" ||
    !("files" in value) ||
    !Array.isArray(value.files)
  )
    throw new Error("Invalid conversation bundle");
  for (const entry of value.files) {
    if (!entry || typeof entry !== "object" || typeof entry.data !== "string")
      throw new Error("Invalid conversation bundle entry");
    const bytes = Buffer.from(entry.data, "base64");
    let content: string;
    try {
      content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error("Conversation redaction requires UTF-8 bundle entries");
    }
    if (content.includes("\0"))
      throw new Error(
        "Conversation redaction requires UTF-8 text bundle entries",
      );
    entry.data = Buffer.from(redactTranscript(content, observation)).toString(
      "base64",
    );
  }
  return JSON.stringify(value);
}
