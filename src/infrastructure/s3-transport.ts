import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import {
  TransportConflict,
  transportKey,
  transportCondition,
} from "../domain/transport.ts";
import type { Transport } from "../domain/transport.types.ts";
import type { S3TransportOptions } from "./s3-transport.types.ts";
import { decodeObject, encodeObject, readLimit } from "./transport-envelope.ts";
import { transportDefaults } from "./transport.constants.ts";

export type { S3TransportOptions } from "./s3-transport.types.ts";

function status(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("$metadata" in error))
    return undefined;
  const meta = error.$metadata;
  return meta &&
    typeof meta === "object" &&
    "httpStatusCode" in meta &&
    typeof meta.httpStatusCode === "number"
    ? meta.httpStatusCode
    : undefined;
}

export function s3Transport(options: S3TransportOptions): Transport {
  if (!options.bucket.trim()) throw new Error("S3 bucket must not be empty");
  const prefix = options.prefix
    ? `${transportKey(options.prefix.replace(/\/$/, ""))}/`
    : "";
  const target = (key: string) => ({
    Bucket: options.bucket,
    Key: `${prefix}${transportKey(key)}`,
  });
  return {
    name: "s3",
    async read(key, settings = {}) {
      settings.signal?.throwIfAborted();
      const maxBytes = readLimit(settings.maxBytes);
      try {
        const value = await options.client.send(
          new GetObjectCommand(target(key)),
          settings.signal ? { abortSignal: settings.signal } : {},
        );
        if (!value.Body) throw new Error("Missing S3 object body");
        const reader = value.Body.transformToWebStream().getReader();
        try {
          if (
            !value.ETag ||
            (value.ContentLength ?? Infinity) >
              maxBytes + transportDefaults.headerBytes
          )
            throw new Error("Invalid or oversized S3 object");
          const chunks: Uint8Array[] = [];
          let size = 0;
          for (;;) {
            settings.signal?.throwIfAborted();
            const chunk = await reader.read();
            if (chunk.done) break;
            size += chunk.value.byteLength;
            if (size > maxBytes + transportDefaults.headerBytes)
              throw new Error("S3 object exceeds byte limit");
            chunks.push(chunk.value);
          }
          return {
            ...decodeObject(Buffer.concat(chunks), key, maxBytes),
            revision: value.ETag,
          };
        } finally {
          await reader.cancel().catch(() => {});
          reader.releaseLock();
        }
      } catch (error) {
        if (status(error) === 404) return undefined;
        throw error;
      }
    },
    async write(key, bytes, settings) {
      transportCondition(settings.ifRevision);
      settings.signal?.throwIfAborted();
      const { entry, data } = encodeObject(key, bytes);
      try {
        const value = await options.client.send(
          new PutObjectCommand({
            ...target(key),
            Body: data,
            ...(settings.ifRevision === null
              ? { IfNoneMatch: "*" }
              : { IfMatch: settings.ifRevision }),
          }),
          settings.signal ? { abortSignal: settings.signal } : {},
        );
        if (!value.ETag) throw new Error("Missing S3 revision after write");
        return { ...entry, revision: value.ETag };
      } catch (error) {
        if ([409, 412].includes(status(error) ?? 0))
          throw new TransportConflict(key);
        throw error;
      }
    },
    async remove(key, settings) {
      transportCondition(settings.ifRevision);
      settings.signal?.throwIfAborted();
      if (settings.ifRevision === null)
        throw new Error("S3 removal requires an existing revision");
      try {
        await options.client.send(
          new DeleteObjectCommand({
            ...target(key),
            IfMatch: settings.ifRevision,
          }),
          settings.signal ? { abortSignal: settings.signal } : {},
        );
      } catch (error) {
        if ([404, 409, 412].includes(status(error) ?? 0))
          throw new TransportConflict(key);
        throw error;
      }
    },
    async *list(filter = "", settings = {}) {
      if (filter) transportKey(filter.replace(/\/$/, ""));
      let cursor: string | undefined;
      const seen = new Set<string>();
      do {
        settings.signal?.throwIfAborted();
        const page = await options.client.send(
          new ListObjectsV2Command({
            Bucket: options.bucket,
            Prefix: prefix + filter,
            ...(cursor ? { ContinuationToken: cursor } : {}),
          }),
          settings.signal ? { abortSignal: settings.signal } : {},
        );
        for (const item of page.Contents ?? []) {
          if (
            !item.Key?.startsWith(prefix + filter) ||
            !item.ETag ||
            !item.LastModified ||
            item.Size === undefined ||
            item.Size < transportDefaults.headerBytes
          )
            throw new Error("Invalid S3 listing entry");
          const key = transportKey(item.Key.slice(prefix.length));
          yield {
            key,
            revision: item.ETag,
            size: item.Size - transportDefaults.headerBytes,
            modifiedAt: item.LastModified.toISOString(),
          };
        }
        cursor = page.IsTruncated ? page.NextContinuationToken : undefined;
        if (page.IsTruncated && (!cursor || seen.has(cursor)))
          throw new Error("Invalid S3 pagination cursor");
        if (cursor) seen.add(cursor);
      } while (cursor);
    },
  };
}
