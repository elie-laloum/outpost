import { OutpostError } from "../domain/errors.ts";
import type { ServerSentEvent } from "./sse.types.ts";

export async function* serverSentEvents(
  body: ReadableStream<Uint8Array>,
  maxBytes: number,
  onChunk: () => void = () => undefined,
): AsyncGenerator<ServerSentEvent> {
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let buffer = "";
  let size = 0;
  let event: string | undefined;
  let data: string[] = [];
  const dispatch = (): ServerSentEvent | undefined => {
    const complete = data.length
      ? { ...(event ? { event } : {}), data: data.join("\n") }
      : undefined;
    event = undefined;
    data = [];
    return complete;
  };
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (!done) {
        onChunk();
        size += value.byteLength;
        if (size > maxBytes)
          throw new OutpostError(
            "response",
            "Model response exceeds maxResponseBytes",
          );
      }
      buffer += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true });
      // A CR at the end of a chunk may be the first half of a CRLF terminator.
      const carriage = !done && buffer.endsWith("\r");
      const lines = (carriage ? buffer.slice(0, -1) : buffer).split(
        /\r\n|\r|\n/,
      );
      buffer = done ? "" : `${lines.pop()!}${carriage ? "\r" : ""}`;
      for (const line of lines) {
        if (line === "") {
          const complete = dispatch();
          if (complete) yield complete;
          continue;
        }
        if (line.startsWith(":")) continue;
        const colon = line.indexOf(":");
        const field = colon < 0 ? line : line.slice(0, colon);
        const raw = colon < 0 ? "" : line.slice(colon + 1);
        const value = raw.startsWith(" ") ? raw.slice(1) : raw;
        if (field === "event") event = value;
        if (field === "data") data.push(value);
      }
      if (!done) continue;
      const complete = dispatch();
      if (complete) yield complete;
      return;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
