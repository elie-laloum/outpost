import { artifactDigestPattern } from "../domain/artifact.constants.ts";
import { randomUUID } from "node:crypto";
import { link, lstat, mkdir, open, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { ArtifactStore } from "../domain/artifact.types.ts";
import { readInspectionFile } from "./inspection-file.ts";
import { artifactMaxBytes } from "./artifact-store.constants.ts";
import type { FileArtifactStoreOptions } from "./artifact-store.types.ts";

async function directory(path: string): Promise<void> {
  const parent = dirname(path);
  if (parent !== path) await directory(parent);
  try {
    await mkdir(path, { mode: 0o700 });
  } catch (error) {
    if (!code(error, "EEXIST")) throw error;
  }
  if (!(await lstat(path)).isDirectory())
    throw new Error("Artifact directory must not contain symlinks");
}

function code(error: unknown, expected: string): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === expected
  );
}

async function readArtifactFile(
  path: string,
  maxBytes: number,
): Promise<Buffer> {
  try {
    return await readInspectionFile(path, maxBytes);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !== "Inspection file changed"
    )
      throw error;
    // Removing the staging hard link can change ctime once after publication.
    return readInspectionFile(path, maxBytes);
  }
}

export function fileArtifactStore(
  options: FileArtifactStoreOptions,
): ArtifactStore {
  const root = resolve(options.directory),
    maxBytes = options.maxBytes ?? artifactMaxBytes;
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1)
    throw new Error("Artifact maxBytes must be a positive safe integer");
  const path = (id: string) => {
    if (!artifactDigestPattern.test(id))
      throw new Error("Invalid artifact storage ID");
    return join(root, `${id}.blob`);
  };
  return {
    async put(id, input, signal) {
      signal?.throwIfAborted();
      const target = path(id);
      if (input.byteLength > maxBytes)
        throw new Error("Artifact exceeds maxBytes");
      const bytes = Buffer.from(input);
      await directory(root);
      const temporary = join(root, `.${randomUUID()}.tmp`);
      try {
        const file = await open(temporary, "wx", 0o600);
        try {
          await file.writeFile(bytes, signal ? { signal } : {});
          await file.sync();
        } finally {
          await file.close();
        }
        signal?.throwIfAborted();
        try {
          await link(temporary, target);
        } catch (error) {
          if (!code(error, "EEXIST")) throw error;
          if (!bytes.equals(await readArtifactFile(target, maxBytes)))
            throw new Error("Existing artifact content integrity mismatch");
        }
        if (process.platform !== "win32") {
          const parent = await open(root, "r");
          try {
            await parent.sync();
          } finally {
            await parent.close();
          }
        }
      } finally {
        await rm(temporary, { force: true });
      }
    },
    async get(id, signal) {
      signal?.throwIfAborted();
      const target = path(id);
      const bytes = await readArtifactFile(target, maxBytes);
      signal?.throwIfAborted();
      return bytes;
    },
  };
}
