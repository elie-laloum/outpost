import { randomUUID } from "node:crypto";
import { access, mkdir, rename, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, posix } from "node:path";
import type { ConversationStore } from "../../domain/conversation.types.ts";
import type { Command, CommandResult } from "../../domain/command.types.ts";
import { invariant, OutpostError } from "../../domain/errors.ts";
import { executeProcess, requireSuccess } from "../process.ts";
import { validId } from "./identity.ts";
import {
  sessionBundleLimits,
  sessionBundleScript,
} from "./session-bundle.constants.ts";
import type { SessionBundleFormat } from "./session-bundle.types.ts";

async function sessionOperation(
  command: Command,
  invoke: (command: Command) => Promise<CommandResult>,
): Promise<void> {
  const result = await invoke(command);
  if (result.status !== 0)
    throw new OutpostError(
      "session",
      `Native session operation failed: ${result.stderr.trim() || "unknown failure"}`,
    );
}

export function sessionBundleCommand(
  mode: "capture" | "restore" | "validate",
  format: SessionBundleFormat,
  id: string,
  home: string,
  cwd: string,
  file: string,
): Command {
  validId(id);
  return {
    executable: "node",
    arguments: [
      "-e",
      sessionBundleScript,
      mode,
      format,
      id,
      home,
      cwd,
      file,
      String(sessionBundleLimits.bytes),
      String(sessionBundleLimits.files),
    ],
  };
}

export function sessionBundlePath(
  format: SessionBundleFormat,
  id: string,
  repository: string,
  home?: string,
): string {
  validId(id);
  return join(
    home ?? repository,
    ".outpost",
    "conversations",
    format,
    `${id}.json`,
  );
}

export function sessionConversations(
  format: SessionBundleFormat,
): ConversationStore {
  return {
    name: format,
    async locate(id, repository, home) {
      const file = sessionBundlePath(format, id, repository, home);
      if (
        await access(file).then(
          () => true,
          () => false,
        )
      ) {
        await sessionOperation(
          sessionBundleCommand(
            "validate",
            format,
            id,
            home ?? homedir(),
            repository,
            file,
          ),
          executeProcess,
        );
        return { id, file, format };
      }
      const scratch = `${file}.${randomUUID()}`;
      try {
        await sessionOperation(
          sessionBundleCommand(
            "capture",
            format,
            id,
            home ?? homedir(),
            repository,
            scratch,
          ),
          executeProcess,
        );
        await rename(scratch, file);
      } finally {
        await rm(scratch, { force: true });
      }
      return { id, file, format };
    },
    async capture(id, context) {
      const file = sessionBundlePath(
        format,
        id,
        context.repository,
        context.home,
      );
      const remote = posix.join(
        context.sandbox.home.replaceAll("\\", "/"),
        ".outpost",
        `session-${randomUUID()}.json`,
      );
      const scratch = `${file}.${randomUUID()}`;
      await mkdir(dirname(file), { recursive: true, mode: 0o700 });
      try {
        await sessionOperation(
          sessionBundleCommand(
            "capture",
            format,
            id,
            context.sandbox.home,
            context.sandbox.root,
            remote,
          ),
          context.sandbox.invoke,
        );
        await context.sandbox.download(remote, scratch);
        await rename(scratch, file);
      } finally {
        await rm(scratch, { force: true });
        await requireSuccess(
          {
            executable: "node",
            arguments: [
              "-e",
              "require('node:fs').rmSync(process.argv[1], {force:true})",
              remote,
            ],
          },
          context.sandbox.invoke,
        );
      }
      return { id, file, format };
    },
    async restore(record, context) {
      invariant(
        record.format === format,
        "Conversation format does not match its storage",
      );
      const remote = posix.join(
        context.sandbox.home.replaceAll("\\", "/"),
        ".outpost",
        `restore-${randomUUID()}.json`,
      );
      try {
        await context.sandbox.upload(record.file, remote);
        await sessionOperation(
          sessionBundleCommand(
            "restore",
            format,
            record.id,
            context.sandbox.home,
            context.sandbox.root,
            remote,
          ),
          context.sandbox.invoke,
        );
      } finally {
        await requireSuccess(
          {
            executable: "node",
            arguments: [
              "-e",
              "require('node:fs').rmSync(process.argv[1], {force:true})",
              remote,
            ],
          },
          context.sandbox.invoke,
        );
      }
    },
  };
}
