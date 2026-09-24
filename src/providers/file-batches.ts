import { randomUUID, createHash } from "node:crypto";
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { gunzipSync } from "node:zlib";
import { OutpostError } from "../domain/errors.ts";
import type {
  FileManifestEntry,
  FileTransfers,
  SandboxLease,
  TransferOptions,
} from "../domain/sandbox.types.ts";
import {
  fileManifest,
  parseManifest,
  sameFile,
  sameLocalFile,
  validateFilePaths,
} from "../infrastructure/file-manifest.ts";
import { safeDestination } from "../infrastructure/files.ts";
import { transfer } from "../infrastructure/transfer.ts";
import {
  fileBatchCleanupScript,
  fileBatchLimits,
  fileBatchScript,
} from "./file-batches.constants.ts";

import { uploadBatch } from "./file-upload.ts";

export function fileBatches(
  lease: Pick<SandboxLease, "invoke" | "download"> &
    Partial<Pick<SandboxLease, "upload">>,
): FileTransfers {
  const run = async (args: readonly string[], options: TransferOptions) => {
    const result = await lease.invoke({
      executable: "node",
      arguments: ["-e", fileBatchScript, ...args],
      retain: fileBatchLimits.manifestBytes,
      ...options,
    });
    if (result.status !== 0)
      throw new OutpostError(
        "provider",
        "Remote file manifest or batch failed",
        { stderr: result.stderr },
      );
    return result.stdout;
  };
  return {
    ...(lease.upload
      ? {
          uploadBatch: uploadBatch({
            invoke: lease.invoke.bind(lease),
            upload: lease.upload.bind(lease),
          }),
        }
      : {}),
    manifest(source, paths, options = {}) {
      return transfer(options, async (signal) => {
        validateFilePaths(paths);
        const result: FileManifestEntry[] = [];
        for (let offset = 0; offset < paths.length;) {
          signal.throwIfAborted();
          const selected = paths.slice(
            offset,
            offset + fileBatchLimits.entries,
          );
          while (
            Buffer.byteLength(JSON.stringify(selected)) >
            fileBatchLimits.argumentBytes
          )
            selected.pop();
          if (!selected.length)
            throw new OutpostError(
              "provider",
              "Manifest path exceeds command size limit",
            );
          offset += selected.length;
          result.push(
            ...parseManifest(
              JSON.parse(
                await run(["manifest", source, JSON.stringify(selected)], {
                  ...options,
                  signal,
                }),
              ),
              selected,
            ),
          );
        }
        return result;
      });
    },
    downloadBatch(source, entries, destination, options = {}) {
      return transfer(options, async (signal) => {
        parseManifest(
          entries,
          entries.map((entry) => entry.path),
        );
        if (!entries.length) return;
        const staging = await mkdtemp(join(tmpdir(), "outpost-batch-"));
        try {
          let pending: FileManifestEntry[] = [],
            bytes = 0;
          const flush = async () => {
            if (!pending.length) return;
            const remote = `${source.replaceAll("\\", "/")}/../.outpost-${randomUUID()}.json.gz`;
            try {
              await run(["batch", source, JSON.stringify(pending), remote], {
                ...options,
                signal,
              });
              signal.throwIfAborted();
              const archive = join(staging, "batch.json.gz");
              await lease.download(remote, archive, { ...options, signal });
              signal.throwIfAborted();
              await unpackBatch(archive, pending, destination, signal);
            } finally {
              await lease
                .invoke({
                  executable: "node",
                  arguments: ["-e", fileBatchCleanupScript, remote],
                  deadlineMs: fileBatchLimits.cleanupMs,
                })
                .catch(() => undefined);
            }
            pending = [];
            bytes = 0;
          };
          for (const entry of entries) {
            signal.throwIfAborted();
            await safeDestination(destination, entry.path);
            if (entry.size > fileBatchLimits.bytes) {
              await flush();
              const target = await safeDestination(destination, entry.path);
              await lease.download(`${source}/${entry.path}`, target, {
                ...options,
                signal,
              });
              if (
                !sameLocalFile(
                  entry,
                  await fileManifest(destination, entry.path),
                )
              )
                throw new OutpostError(
                  "provider",
                  "Remote file changed during transfer",
                  { path: entry.path },
                );
              continue;
            }
            if (
              pending.length >= fileBatchLimits.entries ||
              bytes + entry.size > fileBatchLimits.bytes ||
              Buffer.byteLength(JSON.stringify([...pending, entry])) >
                fileBatchLimits.argumentBytes
            )
              await flush();
            pending.push(entry);
            bytes += entry.size;
          }
          await flush();
        } finally {
          await rm(staging, { recursive: true, force: true });
        }
      });
    },
  };
}

async function unpackBatch(
  archive: string,
  entries: readonly FileManifestEntry[],
  destination: string,
  signal: AbortSignal,
): Promise<void> {
  const payload: unknown = JSON.parse(
    gunzipSync(await readFile(archive), {
      maxOutputLength: fileBatchLimits.decodedBytes,
    }).toString("utf8"),
  );
  const manifest = parseManifest(
    payload,
    entries.map((entry) => entry.path),
  );
  if (!Array.isArray(payload))
    throw new OutpostError("provider", "Invalid file batch");
  for (const [index, entry] of manifest.entries()) {
    signal.throwIfAborted();
    const record: unknown = payload[index];
    if (
      !record ||
      typeof record !== "object" ||
      !("data" in record) ||
      typeof record.data !== "string"
    )
      throw new OutpostError("provider", "Invalid batch payload");
    const data = Buffer.from(record.data, "base64");
    if (
      !sameFile(entry, entries[index]!) ||
      data.length !== entry.size ||
      createHash("sha256").update(data).digest("hex") !== entry.sha256
    )
      throw new OutpostError("provider", "File batch checksum mismatch", {
        path: entry.path,
      });
    const target = await safeDestination(destination, entry.path);
    await mkdir(dirname(target), { recursive: true });
    if (
      await lstat(target).catch((error) => {
        if (error.code === "ENOENT") return undefined;
        throw error;
      })
    )
      throw new OutpostError("provider", "Batch destination already exists", {
        path: entry.path,
      });
    if (entry.kind === "link") {
      await symlink(data.toString("utf8"), target);
      continue;
    }
    await writeFile(target, data, { mode: entry.mode, flag: "wx" });
    await chmod(target, entry.mode);
  }
}
