import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative } from "node:path";
import type { SandboxLease } from "../../domain/sandbox.types.ts";
import type { ConversationLocation } from "../conversations.types.ts";
import { files } from "./files.ts";
import { conversationLayout } from "./layout.ts";
import { remotePath } from "./paths.ts";
import { relocateTranscript } from "./relocate.ts";

export async function restoreConversation(
  location: ConversationLocation,
  lease: SandboxLease,
  staging: string,
): Promise<void> {
  const target = remotePath(location.format, location.id, lease, location.file);
  const contents = relocateTranscript(
    await readFile(location.file, "utf8"),
    lease.root,
  );
  const temporary = join(staging, `${randomUUID()}.jsonl`);
  await mkdir(staging, { recursive: true });
  await writeFile(temporary, contents, { mode: 0o600 });
  try {
    await lease.upload(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
  if (conversationLayout(location.format).sidecars) {
    const sidecars = join(dirname(location.file), location.id, "subagents");
    for (const file of await files(sidecars)) {
      const name = relative(sidecars, file).replaceAll("\\", "/");
      const local = join(staging, `${randomUUID()}.jsonl`);
      await writeFile(
        local,
        relocateTranscript(await readFile(file, "utf8"), lease.root),
        { mode: 0o600 },
      );
      try {
        await lease.upload(
          local,
          posix.join(posix.dirname(target), location.id, "subagents", name),
        );
      } finally {
        await rm(local, { force: true });
      }
    }
  }
}
