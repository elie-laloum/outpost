import { join, posix } from "node:path";
import { OutpostError } from "../domain/errors.ts";
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
    await safeDestination(workspace.directory, file);
    await lease.download(
      posix.join(lease.root, file),
      await safeDestination(join(transfer, "incoming"), file),
    );
  }
  if (head !== synchronized) {
    await run(["bundle", "create", remoteBundle, "HEAD"]);
    await lease.download(remoteBundle, join(transfer, "commits.bundle"));
  }

  return { head, patch, incoming };
}
