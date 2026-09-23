import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, posix, resolve } from "node:path";
import { OutpostError } from "../../domain/errors.ts";
import type { SandboxLease } from "../../domain/sandbox.types.ts";
import type {
  ConversationFormat,
  ConversationLocation,
} from "../conversations.types.ts";
import { safeDestination } from "../files.ts";
import type { CaptureOptions } from "./capture.types.ts";
import { transcriptSearchBytes } from "./conversation.constants.ts";
import { files } from "./files.ts";
import { conversationLayout } from "./layout.ts";
import { locateConversation } from "./locate.ts";
import { validId } from "./paths.ts";
import { relocateTranscript } from "./relocate.ts";

export async function captureConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  lease: SandboxLease,
  staging: string,
  options: CaptureOptions = {},
): Promise<ConversationLocation> {
  validId(id);
  const home = options.home ?? homedir();
  const layout = conversationLayout(format);
  const search = layout.remoteSearchRoot(lease.home);
  const pattern = layout.pattern(id);
  const result = options.local
    ? {
        status: 0,
        stdout: (await locateConversation(format, id, lease.root, lease.home))
          .file,
      }
    : await lease.invoke({
        executable: "find",
        arguments: [search, "-type", "f", "-name", pattern],
        retain: transcriptSearchBytes,
      });
  const remote = result.stdout.trim().split("\n").filter(Boolean)[0];
  if (result.status !== 0 || !remote)
    throw new OutpostError(
      "session",
      `Agent emitted conversation ${id} but its transcript is unavailable`,
      { id, search },
    );
  const file = layout.capturePath(id, repository, home, remote);
  await mkdir(staging, { recursive: true });
  const temporary = join(staging, `${randomUUID()}.jsonl`);
  await lease.download(remote, temporary);
  await mkdir(dirname(file), { recursive: true });
  try {
    await writeFile(
      file,
      relocateTranscript(
        await readFile(temporary, "utf8"),
        resolve(repository),
      ),
      { mode: 0o600 },
    );
  } finally {
    await rm(temporary, { force: true });
  }
  if (layout.sidecars) {
    const remoteSidecars = posix.join(posix.dirname(remote), id, "subagents");
    const listed = options.local
      ? {
          status: 0,
          stdout: (await files(join(dirname(remote), id, "subagents"))).join(
            "\n",
          ),
        }
      : await lease.invoke({
          executable: "find",
          arguments: [remoteSidecars, "-type", "f", "-name", "*.jsonl"],
          retain: transcriptSearchBytes,
        });
    if (listed.status === 0)
      for (const child of listed.stdout.split("\n").filter(Boolean)) {
        try {
          const scratch = join(staging, `${randomUUID()}.jsonl`);
          await lease.download(child, scratch);
          const destination = await safeDestination(
            join(dirname(file), id, "subagents"),
            posix.relative(
              remoteSidecars.replaceAll("\\", "/"),
              child.replaceAll("\\", "/"),
            ),
          );
          await mkdir(dirname(destination), { recursive: true });
          try {
            await writeFile(
              destination,
              relocateTranscript(
                await readFile(scratch, "utf8"),
                resolve(repository),
              ),
              { mode: 0o600 },
            );
          } finally {
            await rm(scratch, { force: true });
          }
        } catch (cause) {
          options.warn?.(
            `Could not capture child transcript: ${String(cause)}`,
          );
        }
      }
  }
  return { id, file, format };
}
