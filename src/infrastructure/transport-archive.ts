import { createHash } from "node:crypto";
import { lstat, open, readlink, mkdir, symlink, chmod } from "node:fs/promises";
import { dirname } from "node:path";
import { inspectionFileFlags } from "./inspection-file.constants.ts";
import type {
  Transport,
  TransportReference,
} from "../domain/transport.types.ts";
import { invariant, positive } from "../domain/errors.ts";
import { safeDestination } from "./files.ts";
import {
  jsonBytes,
  jsonObject,
  readReference,
  transportReference,
} from "./transport-json.ts";
import type {
  ArchiveManifest,
  ArchiveFile,
  ArchiveChunk,
} from "./transport-archive.types.ts";
import { archiveDefaults as defaults } from "./transport-archive.constants.ts";

const digest = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

export async function archiveFiles(
  transporter: Transport,
  root: string,
  paths: readonly string[],
  prefix: string,
  maxBytes = defaults.maxBytes,
): Promise<TransportReference> {
  positive(maxBytes, "maxBytes");
  invariant(
    paths.length <= defaults.maxFiles && new Set(paths).size === paths.length,
    "Invalid archive path count",
  );
  const files: ArchiveFile[] = [];
  let total = 0;
  for (const path of paths) {
    const source = await safeDestination(root, path);
    const info = await lstat(source);
    invariant(
      info.isFile() || info.isSymbolicLink(),
      "Unsupported archive entry",
    );
    const chunks: ArchiveChunk[] = [];
    let size = 0;
    const publish = async (bytes: Uint8Array) => {
      total += bytes.length;
      size += bytes.length;
      invariant(total <= maxBytes, "Archive exceeds byte limit");
      const reference = await transporter.write(
        `${prefix}/files/${files.length}/${chunks.length}`,
        bytes,
        { ifRevision: null },
      );
      chunks.push({ reference, sha256: digest(bytes), size: bytes.length });
    };
    if (info.isSymbolicLink())
      await publish(Buffer.from(await readlink(source)));
    if (info.isFile()) {
      const file = await open(source, inspectionFileFlags);
      try {
        const buffer = Buffer.alloc(defaults.chunkBytes);
        for (;;) {
          const { bytesRead } = await file.read(buffer, 0, buffer.length, null);
          if (!bytesRead) break;
          await publish(Buffer.from(buffer.subarray(0, bytesRead)));
        }
        const after = await file.stat();
        invariant(
          info.ino === after.ino &&
            info.dev === after.dev &&
            info.size === size &&
            info.mtimeMs === after.mtimeMs &&
            info.ctimeMs === after.ctimeMs,
          "Archive source changed",
        );
      } finally {
        await file.close();
      }
    }
    files.push({
      path,
      kind: info.isSymbolicLink() ? "symlink" : "file",
      mode: info.mode & 0o777,
      size,
      chunks,
    });
  }
  const manifest: ArchiveManifest = { format: 1, files };
  const bytes = jsonBytes(manifest);
  invariant(
    bytes.length <= defaults.manifestBytes,
    "Archive manifest exceeds byte limit",
  );
  return transporter.write(`${prefix}/manifest`, bytes, { ifRevision: null });
}

export function archiveManifest(value: unknown): ArchiveManifest {
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === 1 &&
      "files" in value &&
      Array.isArray(value.files) &&
      value.files.length <= defaults.maxFiles,
    "Invalid archive manifest",
  );
  const files: ArchiveFile[] = value.files.map((file: unknown) => {
    invariant(
      file &&
        typeof file === "object" &&
        "path" in file &&
        typeof file.path === "string" &&
        "kind" in file &&
        (file.kind === "file" || file.kind === "symlink") &&
        "mode" in file &&
        typeof file.mode === "number" &&
        Number.isInteger(file.mode) &&
        file.mode >= 0 &&
        file.mode <= 0o777 &&
        "size" in file &&
        typeof file.size === "number" &&
        Number.isSafeInteger(file.size) &&
        file.size >= 0 &&
        "chunks" in file &&
        Array.isArray(file.chunks),
      "Invalid archive file",
    );
    const chunks = file.chunks.map((chunk: unknown): ArchiveChunk => {
      invariant(
        chunk &&
          typeof chunk === "object" &&
          "reference" in chunk &&
          "sha256" in chunk &&
          typeof chunk.sha256 === "string" &&
          /^[a-f0-9]{64}$/.test(chunk.sha256) &&
          "size" in chunk &&
          typeof chunk.size === "number" &&
          Number.isSafeInteger(chunk.size) &&
          chunk.size >= 0 &&
          chunk.size <= defaults.chunkBytes,
        "Invalid archive chunk",
      );
      return {
        reference: transportReference(chunk.reference),
        sha256: chunk.sha256,
        size: chunk.size,
      };
    });
    invariant(
      chunks.reduce((sum, chunk) => sum + chunk.size, 0) === file.size,
      "Archive file size mismatch",
    );
    return {
      path: file.path,
      kind: file.kind,
      mode: file.mode,
      size: file.size,
      chunks,
    };
  });
  invariant(
    new Set(files.map((file) => file.path)).size === files.length,
    "Duplicate archive paths",
  );
  return { format: 1, files };
}

export async function restoreArchiveFiles(
  transporter: Transport,
  reference: TransportReference,
  destination: string,
  maxBytes = defaults.maxBytes,
): Promise<void> {
  positive(maxBytes, "maxBytes");
  const manifest = archiveManifest(
    jsonObject(
      await readReference(transporter, reference, defaults.manifestBytes),
    ),
  );
  const total = manifest.files.reduce((sum, file) => sum + file.size, 0);
  invariant(
    Number.isSafeInteger(total) && total <= maxBytes,
    "Archive exceeds byte limit",
  );
  for (const file of manifest.files)
    await safeDestination(destination, file.path);
  await mkdir(destination, { mode: 0o700 });
  for (const entry of manifest.files) {
    const target = await safeDestination(destination, entry.path);
    await mkdir(dirname(target), { recursive: true, mode: 0o700 });
    const data = async (chunk: ArchiveChunk) => {
      const value = await readReference(
        transporter,
        chunk.reference,
        chunk.size,
      );
      invariant(
        value.bytes.length === chunk.size &&
          digest(value.bytes) === chunk.sha256,
        "Archive chunk integrity mismatch",
      );
      return value.bytes;
    };
    if (entry.kind === "symlink") {
      invariant(
        entry.size <= defaults.chunkBytes,
        "Archive symlink exceeds limit",
      );
      const chunks = [];
      for (const chunk of entry.chunks) chunks.push(await data(chunk));
      await symlink(Buffer.concat(chunks).toString(), target);
      continue;
    }
    const file = await open(target, "wx", 0o600);
    try {
      for (const chunk of entry.chunks) await file.writeFile(await data(chunk));
      await file.sync();
    } finally {
      await file.close();
    }
    await chmod(target, entry.mode);
  }
}
