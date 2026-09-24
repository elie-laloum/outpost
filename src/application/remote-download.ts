import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import {
  fileManifest,
  parseManifest,
  sameFile,
  sameLocalFile,
} from "../infrastructure/file-manifest.ts";
import type { FileManifestEntry } from "../domain/sandbox.types.ts";
import { safeDestination } from "../infrastructure/files.ts";
import type {
  RemoteChanges,
  RemoteWorkspaceContext,
} from "./remote-workspace.types.ts";

export async function downloadChanges(
  context: RemoteWorkspaceContext,
  synchronized: string,
  transfer: string,
): Promise<RemoteChanges> {
  const { workspace, lease, remoteBundle, run } = context;
  const head = (await run(["rev-parse", "HEAD"])).trim(),
    patch = join(transfer, "remote.patch");
  await run(["diff", "--binary", "HEAD", `--output=${remoteBundle}.patch`]);
  await lease.download(`${remoteBundle}.patch`, patch);
  const incoming = (
    await run(["ls-files", "--others", "--exclude-standard", "-z"])
  )
    .split("\0")
    .filter(Boolean);
  for (const file of incoming) {
    if (/^\.outpost\/(locks|recovery|workspaces|logs)(\/|$)/i.test(file))
      throw new OutpostError(
        "workspace",
        "Remote file overlaps Outpost runtime state",
        { file },
      );
    await safeDestination(join(transfer, "incoming"), file);
  }
  let manifest: readonly FileManifestEntry[] | undefined;
  if (lease.fileTransfers) {
    manifest = parseManifest(
      await lease.fileTransfers.manifest(lease.root, incoming),
      incoming,
    );
    await writeFile(join(transfer, "manifest.json"), JSON.stringify(manifest), {
      mode: 0o600,
    });
    const changed: FileManifestEntry[] = [];
    for (const entry of manifest) {
      const previous = context.transferred?.get(entry.path);
      if (
        previous &&
        sameFile(previous, entry) &&
        sameLocalFile(
          entry,
          await fileManifest(workspace.directory, entry.path),
        )
      ) {
        const target = await safeDestination(
          join(transfer, "incoming"),
          entry.path,
        );
        await mkdir(dirname(target), { recursive: true });
        await cp(
          await safeDestination(workspace.directory, entry.path),
          target,
          { dereference: false, verbatimSymlinks: true },
        );
        continue;
      }
      changed.push(entry);
    }
    await lease.fileTransfers.downloadBatch(
      lease.root,
      changed,
      join(transfer, "incoming"),
    );
    for (const entry of manifest) {
      if (
        !sameLocalFile(
          entry,
          await fileManifest(join(transfer, "incoming"), entry.path),
        )
      )
        throw new OutpostError("workspace", "Incoming file checksum mismatch", {
          file: entry.path,
        });
    }
  } else
    for (const file of incoming) {
      await lease.download(
        posix.join(lease.root, file),
        await safeDestination(join(transfer, "incoming"), file),
      );
    }
  if (head !== synchronized) {
    await run(["bundle", "create", remoteBundle, "HEAD"]);
    await lease.download(remoteBundle, join(transfer, "commits.bundle"));
  }

  return { head, patch, incoming, ...(manifest ? { manifest } : {}) };
}
