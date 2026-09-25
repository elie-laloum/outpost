import type {
  Transport,
  TransportObject,
  TransportReference,
} from "../domain/transport.types.ts";
import { TransportConflict } from "../domain/transport.ts";

export function jsonBytes(value: unknown): Uint8Array {
  return Buffer.from(JSON.stringify(value));
}

export function jsonObject(value: TransportObject | undefined): unknown {
  return value
    ? JSON.parse(Buffer.from(value.bytes).toString("utf8"))
    : undefined;
}

export async function immutableObject(
  transporter: Transport,
  key: string,
  bytes: Uint8Array,
  signal?: AbortSignal,
) {
  try {
    return await transporter.write(key, bytes, {
      ifRevision: null,
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (!(error instanceof TransportConflict)) throw error;
    const existing = await transporter.read(key, {
      maxBytes: bytes.byteLength,
      ...(signal ? { signal } : {}),
    });
    if (!existing || !Buffer.from(bytes).equals(existing.bytes))
      throw new Error("Existing object content integrity mismatch");
    return existing;
  }
}

export async function readReference(
  transporter: Transport,
  reference: TransportReference,
  maxBytes?: number,
): Promise<TransportObject> {
  const value = await transporter.read(
    reference.key,
    maxBytes === undefined ? {} : { maxBytes },
  );
  if (!value || value.revision !== reference.revision)
    throw new TransportConflict(reference.key);
  return value;
}
export function transportReference(value: unknown): TransportReference {
  if (
    !value ||
    typeof value !== "object" ||
    !("key" in value) ||
    typeof value.key !== "string" ||
    !("revision" in value) ||
    typeof value.revision !== "string" ||
    !value.revision
  )
    throw new Error("Invalid transport reference");
  return { key: value.key, revision: value.revision };
}
