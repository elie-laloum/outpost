import { transportDefaults } from "./transport.constants.ts";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { invariant } from "../domain/errors.ts";
import { transportKey } from "../domain/transport.ts";
import { s3TombstoneMetadata } from "./s3-transport.constants.ts";
import type { S3TombstonePruneOptions } from "./s3-tombstones.types.ts";

/** Remove tombstones only while every writer using the selected prefix is stopped. */
export async function pruneS3Tombstones(
  options: S3TombstonePruneOptions,
): Promise<number> {
  invariant(
    options.writersStopped === true,
    "S3 tombstone pruning requires writersStopped: true",
  );
  invariant(options.bucket.trim(), "S3 bucket must not be empty");
  const prefix = `${transportKey(options.prefix.replace(/\/$/, ""))}/`;
  const settings = options.signal ? { abortSignal: options.signal } : {};
  let removed = 0;
  let cursor: string | undefined;
  const seen = new Set<string>();
  const keys: string[] = [];
  do {
    options.signal?.throwIfAborted();
    const page = await options.client.send(
      new ListObjectsV2Command({
        Bucket: options.bucket,
        Prefix: prefix,
        ...(cursor ? { ContinuationToken: cursor } : {}),
      }),
      settings,
    );
    for (const item of page.Contents ?? []) {
      options.signal?.throwIfAborted();
      invariant(
        typeof item.Key === "string" && item.Key.startsWith(prefix),
        "Invalid S3 listing entry",
      );
      invariant(
        keys.length < transportDefaults.maxEntries,
        "Too many objects for offline pruning; select a narrower prefix",
      );
      keys.push(item.Key);
    }
    cursor = page.IsTruncated ? page.NextContinuationToken : undefined;
    invariant(
      !page.IsTruncated || (cursor && !seen.has(cursor)),
      "Invalid S3 pagination cursor",
    );
    if (cursor) seen.add(cursor);
  } while (cursor);
  for (const key of keys) {
    options.signal?.throwIfAborted();
    const target = { Bucket: options.bucket, Key: key };
    const current = await options.client.send(
      new HeadObjectCommand(target),
      settings,
    );
    if (current.Metadata?.[s3TombstoneMetadata] !== "true") continue;
    // Quiescence is required because compatible stores may ignore conditional deletes.
    await options.client.send(new DeleteObjectCommand(target), settings);
    removed++;
  }
  return removed;
}
