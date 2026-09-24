import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  mkdtemp,
  open,
  readlink,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
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
} from "../infrastructure/file-manifest.ts";
import { inspectionFileFlags } from "../infrastructure/inspection-file.constants.ts";
import { safeDestination } from "../infrastructure/files.ts";
import { transfer } from "../infrastructure/transfer.ts";
import { fileBatchLimits } from "./file-batches.constants.ts";
import { fileUploadScript } from "./file-upload.constants.ts";

export function uploadBatch(
  lease: Pick<SandboxLease, "invoke" | "upload">,
): NonNullable<FileTransfers["uploadBatch"]> {
  return (source, entries, destination, options = {}) =>
    transfer(options, async (signal) => {
      parseManifest(
        entries,
        entries.map((entry) => entry.path),
      );
      const run = async (
        operation: string,
        input: string,
        staging = "",
        controls: TransferOptions = { ...options, signal },
      ) => {
        const result = await lease.invoke({
          executable: "node",
          arguments: [
            "-e",
            fileUploadScript,
            operation,
            destination,
            input,
            staging,
          ],
          retain: fileBatchLimits.manifestBytes,
          ...controls,
        });
        if (result.status !== 0)
          throw new OutpostError("provider", "Remote file upload failed", {
            stderr: result.stderr,
          });
        return result.stdout;
      };
      const staging = await mkdtemp(join(tmpdir(), "outpost-upload-"));
      try {
        let pending: FileManifestEntry[] = [],
          bytes = 0;
        const flush = async () => {
          if (!pending.length) return;
          signal.throwIfAborted();
          for (const entry of pending) {
            if (
              !sameFile(entry, await fileManifest(source, entry.path, signal))
            )
              throw new OutpostError("provider", "Upload source changed", {
                path: entry.path,
              });
          }
          const missing: unknown = JSON.parse(
            await run("missing", JSON.stringify(pending)),
          );
          if (
            !Array.isArray(missing) ||
            missing.some(
              (path) =>
                typeof path !== "string" ||
                !pending.some((entry) => entry.path === path),
            ) ||
            new Set(missing).size !== missing.length
          )
            throw new OutpostError(
              "provider",
              "Invalid destination upload manifest",
            );
          const selected = pending.filter((entry) =>
            missing.includes(entry.path),
          );
          if (selected.length) {
            const remote = `${destination.replaceAll("\\", "/").replace(/\/$/, "")}/.outpost-upload-${randomUUID()}`;
            try {
              if ((await run("stage", remote)) !== remote)
                throw new OutpostError(
                  "provider",
                  "Invalid remote upload staging path",
                );
              const payload = join(staging, "payload");
              await rm(payload, { force: true });
              const large = selected[0]!.size > fileBatchLimits.bytes;
              if (large) {
                const entry = selected[0]!;
                await copyFile(
                  await safeDestination(source, entry.path),
                  payload,
                );
                if (
                  !sameFile(
                    { ...entry, path: "payload" },
                    await fileManifest(staging, "payload", signal),
                  )
                )
                  throw new OutpostError("provider", "Upload source changed", {
                    path: entry.path,
                  });
              } else {
                const records = [];
                for (const entry of selected) {
                  signal.throwIfAborted();
                  const path = await safeDestination(source, entry.path);
                  const data =
                    entry.kind === "link"
                      ? Buffer.from(await readlink(path))
                      : await readPayload(path, entry.size, signal);
                  if (
                    data.length !== entry.size ||
                    createHash("sha256").update(data).digest("hex") !==
                      entry.sha256 ||
                    !sameFile(
                      entry,
                      await fileManifest(source, entry.path, signal),
                    )
                  )
                    throw new OutpostError(
                      "provider",
                      "Upload source changed",
                      { path: entry.path },
                    );
                  records.push({ ...entry, data: data.toString("base64") });
                }
                await writeFile(
                  payload,
                  gzipSync(Buffer.from(JSON.stringify(records))),
                  { mode: 0o600 },
                );
              }
              signal.throwIfAborted();
              await lease.upload(payload, `${remote}/payload`, {
                ...options,
                signal,
              });
              signal.throwIfAborted();
              await run(
                large ? "large" : "batch",
                JSON.stringify(selected),
                remote,
              );
            } finally {
              await run("cleanup", remote, "", {
                deadlineMs: fileBatchLimits.cleanupMs,
              }).catch(() => undefined);
            }
          }
          for (const entry of pending) {
            if (
              !sameFile(entry, await fileManifest(source, entry.path, signal))
            )
              throw new OutpostError("provider", "Upload source changed", {
                path: entry.path,
              });
          }
          signal.throwIfAborted();
          pending = [];
          bytes = 0;
        };
        for (const entry of entries) {
          if (
            Buffer.byteLength(JSON.stringify([entry])) >
            fileBatchLimits.argumentBytes
          )
            throw new OutpostError(
              "provider",
              "Upload path exceeds command size limit",
            );
          if (
            pending.length >= fileBatchLimits.entries ||
            bytes + entry.size > fileBatchLimits.bytes ||
            Buffer.byteLength(JSON.stringify([...pending, entry])) >
              fileBatchLimits.argumentBytes
          )
            await flush();
          pending.push(entry);
          bytes += entry.size;
          if (entry.size > fileBatchLimits.bytes) await flush();
        }
        await flush();
      } finally {
        await rm(staging, { recursive: true, force: true });
      }
    });
}

async function readPayload(
  path: string,
  size: number,
  signal: AbortSignal,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  const file = await open(path, inspectionFileFlags);
  for await (const chunk of file.createReadStream({ signal })) {
    bytes += chunk.length;
    if (bytes > size)
      throw new OutpostError("provider", "Upload source changed", { path });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
