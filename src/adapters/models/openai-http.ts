import { OutpostError } from "../../domain/errors.ts";

export async function modelJson(
  response: Response,
  maxBytes: number,
): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new OutpostError("response", "Model response has no body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes)
        throw new OutpostError(
          "response",
          "Model response exceeds maxResponseBytes",
        );
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new OutpostError("response", "Model response is not valid JSON");
  }
}
