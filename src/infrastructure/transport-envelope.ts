import { randomUUID } from "node:crypto";
import type {
  TransportEntry,
  TransportObject,
} from "../domain/transport.types.ts";
import { transportDefaults } from "./transport.constants.ts";

export function encodeObject(key: string, bytes: Uint8Array) {
  if (bytes.byteLength > transportDefaults.maxBytes)
    throw new Error(
      "Transport object exceeds 64 MiB; split large payloads into chunks",
    );
  const entry: TransportEntry = {
    key,
    revision: randomUUID(),
    size: bytes.byteLength,
    modifiedAt: new Date().toISOString(),
  };
  const header = Buffer.alloc(transportDefaults.headerBytes, " ");
  header.write(JSON.stringify(entry));
  return { entry, data: Buffer.concat([header, bytes]) };
}

export function decodeObject(
  data: Uint8Array,
  key: string,
  maxBytes: number,
): TransportObject {
  const buffer = Buffer.from(data);
  const value: unknown = JSON.parse(
    buffer.subarray(0, transportDefaults.headerBytes).toString(),
  );
  const bytes = buffer.subarray(transportDefaults.headerBytes);
  if (
    !value ||
    typeof value !== "object" ||
    !("key" in value) ||
    value.key !== key ||
    !("revision" in value) ||
    typeof value.revision !== "string" ||
    !value.revision ||
    !("size" in value) ||
    value.size !== bytes.length ||
    bytes.length > maxBytes ||
    !("modifiedAt" in value) ||
    typeof value.modifiedAt !== "string" ||
    !Number.isFinite(Date.parse(value.modifiedAt))
  )
    throw new Error("Invalid or oversized transport object");
  return {
    key,
    revision: value.revision,
    size: bytes.length,
    modifiedAt: value.modifiedAt,
    bytes,
  };
}

export function readLimit(maxBytes = transportDefaults.maxBytes): number {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0)
    throw new Error("Invalid transport byte limit");
  return maxBytes;
}
