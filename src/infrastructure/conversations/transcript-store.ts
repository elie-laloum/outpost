import { redactTranscript } from "./redaction.ts";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, posix, relative, resolve } from "node:path";
import type {
  ConversationContext,
  ConversationRecord,
  NativeConversationStore,
} from "../../domain/conversation.types.ts";
import { invariant, OutpostError } from "../../domain/errors.ts";
import type { SandboxLease } from "../../domain/sandbox.types.ts";
import { safeDestination } from "../files.ts";
import { transcriptSearchBytes } from "./conversation.constants.ts";
import { files } from "./files.ts";
import { validId } from "./identity.ts";
import type { TranscriptConversationLayout } from "./layout.types.ts";
import { relocateTranscript } from "./relocate.ts";

async function locateTranscript(
  layout: TranscriptConversationLayout,
  id: string,
  repository: string,
  home = homedir(),
): Promise<ConversationRecord> {
  validId(id);
  const { format } = layout;
  const expected = layout.preferredPath?.(id, repository, home);
  if (expected && (await stat(expected).catch(() => undefined))?.isFile())
    return { id, file: expected, format };
  const found = (await files(layout.searchRoot(home))).find((file) =>
    layout.matches(file, id),
  );
  if (found) return { id, file: found, format };
  throw new OutpostError(
    "session",
    `Conversation ${id} was not found in native ${format} storage`,
    { id, repository },
  );
}

async function captureSidecars(
  id: string,
  remote: string,
  file: string,
  context: ConversationContext,
): Promise<void> {
  const { sandbox, staging, repository } = context;
  const remoteSidecars = posix.join(
    posix.dirname(remote.replaceAll("\\", "/")),
    id,
    "subagents",
  );
  const listed = context.local
    ? {
        status: 0,
        stdout: (await files(join(dirname(remote), id, "subagents"))).join(
          "\n",
        ),
      }
    : await sandbox.invoke({
        executable: "find",
        arguments: [remoteSidecars, "-type", "f", "-name", "*.jsonl"],
        retain: transcriptSearchBytes,
      });
  if (listed.status !== 0) return;
  for (const child of listed.stdout.split("\n").filter(Boolean)) {
    try {
      const scratch = join(staging, `${randomUUID()}.jsonl`);
      await sandbox.download(child, scratch);
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
            redactTranscript(
              await readFile(scratch, "utf8"),
              context.observation,
            ),
            resolve(repository),
          ),
          { mode: 0o600 },
        );
      } finally {
        await rm(scratch, { force: true });
      }
    } catch (cause) {
      context.warn?.(`Could not capture child transcript: ${String(cause)}`);
    }
  }
}

async function captureTranscript(
  layout: TranscriptConversationLayout,
  id: string,
  context: ConversationContext,
): Promise<ConversationRecord> {
  validId(id);
  const { sandbox, staging, repository } = context;
  const home = context.home ?? homedir();
  const search = layout.remoteSearchRoot(sandbox.home);
  const result = context.local
    ? {
        status: 0,
        stdout: (await locateTranscript(layout, id, sandbox.root, sandbox.home))
          .file,
      }
    : await sandbox.invoke({
        executable: "find",
        arguments: [search, "-type", "f", "-name", layout.pattern(id)],
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
  await sandbox.download(remote, temporary);
  await mkdir(dirname(file), { recursive: true });
  try {
    await writeFile(
      file,
      relocateTranscript(
        redactTranscript(
          await readFile(temporary, "utf8"),
          context.observation,
        ),
        resolve(repository),
      ),
      { mode: 0o600 },
    );
  } finally {
    await rm(temporary, { force: true });
  }
  if (layout.sidecars) await captureSidecars(id, remote, file, context);
  return { id, file, format: layout.format };
}

async function uploadRelocated(
  file: string,
  target: string,
  sandbox: SandboxLease,
  staging: string,
): Promise<void> {
  const temporary = join(staging, `${randomUUID()}.jsonl`);
  await mkdir(staging, { recursive: true });
  await writeFile(
    temporary,
    relocateTranscript(await readFile(file, "utf8"), sandbox.root),
    { mode: 0o600 },
  );
  try {
    await sandbox.upload(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function restoreTranscript(
  layout: TranscriptConversationLayout,
  record: ConversationRecord,
  { sandbox, staging }: ConversationContext,
): Promise<void> {
  validId(record.id);
  const target = layout.remotePath(record.id, sandbox, record.file);
  await uploadRelocated(record.file, target, sandbox, staging);
  if (!layout.sidecars) return;
  const sidecars = join(dirname(record.file), record.id, "subagents");
  for (const file of await files(sidecars))
    await uploadRelocated(
      file,
      posix.join(
        posix.dirname(target),
        record.id,
        "subagents",
        relative(sidecars, file).replaceAll("\\", "/"),
      ),
      sandbox,
      staging,
    );
}

/** Creates a native store for CLIs that keep one JSONL transcript per conversation. */
export function createTranscriptConversations(
  layout: TranscriptConversationLayout,
): NativeConversationStore {
  const { format } = layout;
  invariant(
    typeof format === "string" && format.length > 0,
    "Transcript layouts require a format name",
  );
  return {
    name: format,
    format,
    locate: (id, repository, home) =>
      locateTranscript(layout, id, repository, home),
    capture: (id, context) => captureTranscript(layout, id, context),
    async restore(record, context) {
      invariant(
        record.format === format,
        "Conversation format does not match its storage",
      );
      if (
        context.local &&
        context.sandbox.root === context.repository &&
        record.reference === undefined
      )
        return;
      return restoreTranscript(layout, record, context);
    },
    directory: (repository, home) =>
      layout.directory(repository, home ?? homedir()),
    destination(id, sandbox, original) {
      validId(id);
      return layout.remotePath(id, sandbox, original);
    },
  };
}
