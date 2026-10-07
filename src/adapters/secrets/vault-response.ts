import { OutpostError } from "../../domain/errors.ts";
import { VAULT_RESPONSE_BYTES } from "./vault.constants.ts";

export async function readVaultDocument(response: Response): Promise<object> {
  const reader = response.body?.getReader();
  if (!reader) throw new OutpostError("provider", "Vault response has no body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > VAULT_RESPONSE_BYTES)
        throw new OutpostError("provider", "Vault response exceeds 2 MiB");
      chunks.push(chunk.value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  let value: unknown;
  try {
    value = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)),
    );
  } catch {
    throw new OutpostError("provider", "Vault response must be UTF-8 JSON");
  }
  if (
    !value ||
    typeof value !== "object" ||
    !("data" in value) ||
    !value.data ||
    typeof value.data !== "object" ||
    !("data" in value.data) ||
    !value.data.data ||
    typeof value.data.data !== "object" ||
    Array.isArray(value.data.data)
  )
    throw new OutpostError(
      "provider",
      "Vault response is not a KV v2 document",
    );
  return value.data.data;
}
