import { redactBundle } from "./redaction.ts";
import { randomUUID } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, posix } from "node:path";
import type { NativeConversationStore } from "../../domain/conversation.types.ts";
import type { Command, CommandResult } from "../../domain/command.types.ts";
import { invariant, OutpostError } from "../../domain/errors.ts";
import { executeProcess, requireSuccess } from "../process.ts";
import { validId } from "./identity.ts";
import {
  sessionBundleLimits,
  sessionBundleScript,
} from "./session-bundle.constants.ts";
import type { SessionBundleProfile } from "./session-bundle.types.ts";

function hookSource(
  name: "validate" | "bucket" | "relocate",
  hook: unknown,
): string | undefined {
  if (hook === undefined) return undefined;
  invariant(
    typeof hook === "function",
    `Session bundle ${name} must be a function`,
  );
  const source = Function.prototype.toString.call(hook);
  try {
    // Compiles without running: hooks execute later in the sandbox from their source.
    new Function(`return (${source})`);
  } catch {
    invariant(
      false,
      `Session bundle ${name} must be a self-contained function expression, not a method`,
    );
  }
  return source;
}

function pattern(name: string, value: unknown) {
  invariant(value instanceof RegExp, `Session bundle ${name} must be a RegExp`);
  invariant(
    !/[gy]/.test(value.flags),
    `Session bundle ${name} cannot use the g or y flags`,
  );
  return { source: value.source, flags: value.flags };
}

/** Serializes a profile into the argument read by the in-sandbox bundle script. */
export function sessionBundleProfile(profile: SessionBundleProfile): string {
  const { format, root, sessions, required, relocated = [] } = profile;
  for (const [name, value] of Object.entries({
    format,
    sessions,
    "root.directory": root?.directory,
  }))
    invariant(
      typeof value === "string" && value.length > 0,
      `Session bundle ${name} must be a non-empty string`,
    );
  invariant(
    root.variable === undefined ||
      /^[A-Za-z_][A-Za-z0-9_]*$/.test(root.variable),
    "Session bundle root.variable must be an environment variable name",
  );
  invariant(
    Array.isArray(required) && required.length > 0,
    "Session bundles require at least one required file",
  );
  invariant(
    !profile.buckets || profile.bucket !== undefined,
    "Bucketed session bundles require a bucket function",
  );
  return JSON.stringify({
    format,
    root,
    sessions,
    buckets: profile.buckets === true,
    include: pattern("include", profile.include),
    ...(profile.exclude === undefined
      ? {}
      : { exclude: pattern("exclude", profile.exclude) }),
    required,
    relocated,
    validate: hookSource("validate", profile.validate),
    bucket: hookSource("bucket", profile.bucket),
    relocate: hookSource("relocate", profile.relocate),
  });
}

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
  profile: string,
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
      profile,
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
  format: string,
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

/** Creates a native store for CLIs that keep each session as a directory. */
export function createSessionBundleConversations(
  sessionProfile: SessionBundleProfile,
): NativeConversationStore {
  const profile = sessionBundleProfile(sessionProfile);
  const { format } = sessionProfile;
  return {
    name: format,
    format,
    directory: (repository, home) =>
      join(home ?? repository, ".outpost", "conversations", format),
    destination(id, sandbox) {
      validId(id);
      return posix.join(
        sandbox.home,
        ".outpost",
        "conversations",
        format,
        `${id}.json`,
      );
    },
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
            profile,
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
            profile,
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
            profile,
            id,
            context.sandbox.home,
            context.sandbox.root,
            remote,
          ),
          context.sandbox.invoke,
        );
        await context.sandbox.download(remote, scratch);
        if (context.observation)
          await writeFile(
            scratch,
            redactBundle(await readFile(scratch, "utf8"), context.observation),
            { mode: 0o600 },
          );
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
            profile,
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
