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
  const bytes = buffer.subarray(transportDefaults.headerBytes);
  return {
    ...decodeObjectEntry(buffer, key, data.byteLength, maxBytes),
    bytes,
  };
}

export function decodeObjectEntry(
  data: Uint8Array,
  key: string,
  fileSize: number,
  maxBytes: number,
): TransportEntry {
  const size = fileSize - transportDefaults.headerBytes;
  if (
    !Number.isSafeInteger(size) ||
    size < 0 ||
    size > maxBytes ||
    data.byteLength < transportDefaults.headerBytes
  )
    throw new Error("Invalid or oversized transport object");
  const value: unknown = JSON.parse(
    Buffer.from(data.subarray(0, transportDefaults.headerBytes)).toString(),
  );
  if (
    value &&
    typeof value === "object" &&
    "key" in value &&
    typeof value.key === "string" &&
    value.key !== key &&
    value.key.toLowerCase() === key.toLowerCase()
  )
    throw new Error("Transport key casing conflicts with the stored key");
  if (
    !value ||
    typeof value !== "object" ||
    !("key" in value) ||
    value.key !== key ||
    !("revision" in value) ||
    typeof value.revision !== "string" ||
    !value.revision ||
    !("size" in value) ||
    value.size !== size ||
    !("modifiedAt" in value) ||
    typeof value.modifiedAt !== "string" ||
    !Number.isFinite(Date.parse(value.modifiedAt))
  )
    throw new Error("Invalid or oversized transport object");
  return {
    key,
    revision: value.revision,
    size,
    modifiedAt: value.modifiedAt,
  };
}

export function readLimit(maxBytes = transportDefaults.maxBytes): number {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0)
    throw new Error("Invalid transport byte limit");
  return maxBytes;
}
