import {
  GetObjectCommand,
  HeadObjectCommand,
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
import { s3DeleteMode, s3TombstoneMetadata } from "./s3-transport.constants.ts";

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

export function createS3Transport(options: S3TransportOptions): Transport {
  if (!options.bucket.trim()) throw new Error("S3 bucket must not be empty");
  const deleteMode = options.deleteMode ?? s3DeleteMode;
  if (deleteMode !== "conditional" && deleteMode !== "tombstone")
    throw new Error("Invalid S3 delete mode");
  const prefix = options.prefix
    ? `${transportKey(options.prefix.replace(/\/$/, ""))}/`
    : "";
  const target = (key: string) => ({
    Bucket: options.bucket,
    Key: `${prefix}${transportKey(key)}`,
  });
  async function head(key: string, signal?: AbortSignal) {
    try {
      return await options.client.send(
        new HeadObjectCommand(target(key)),
        signal ? { abortSignal: signal } : {},
      );
    } catch (error) {
      if (status(error) === 404) return undefined;
      throw error;
    }
  }
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
          if (value.Metadata?.[s3TombstoneMetadata] === "true")
            return undefined;
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
      let revision = settings.ifRevision;
      if (deleteMode === "tombstone" && revision === null) {
        const current = await head(key, settings.signal);
        if (current?.Metadata?.[s3TombstoneMetadata] === "true") {
          if (!current.ETag) throw new Error("Missing S3 tombstone revision");
          revision = current.ETag;
        }
      }
      try {
        const value = await options.client.send(
          new PutObjectCommand({
            ...target(key),
            Body: data,
            ...(revision === null
              ? { IfNoneMatch: "*" }
              : { IfMatch: revision }),
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
        if (deleteMode === "tombstone") {
          const { data } = encodeObject(key, new Uint8Array());
          const value = await options.client.send(
            new PutObjectCommand({
              ...target(key),
              IfMatch: settings.ifRevision,
              Body: data,
              Metadata: { [s3TombstoneMetadata]: "true" },
            }),
            settings.signal ? { abortSignal: settings.signal } : {},
          );
          if (!value.ETag) throw new Error("Missing S3 revision after removal");
          return;
        }
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
          if (deleteMode === "tombstone") {
            const current = await head(key, settings.signal);
            if (!current || current.Metadata?.[s3TombstoneMetadata] === "true")
              continue;
            if (
              !current.ETag ||
              !current.LastModified ||
              current.ContentLength === undefined ||
              current.ContentLength < transportDefaults.headerBytes
            )
              throw new Error("Invalid S3 listing object");
            yield {
              key,
              revision: current.ETag,
              size: current.ContentLength - transportDefaults.headerBytes,
              modifiedAt: current.LastModified.toISOString(),
            };
            continue;
          }
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
