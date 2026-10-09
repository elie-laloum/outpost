import type { RequiredAgent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import { validateBrief } from "../domain/prompts.ts";
import { git } from "../infrastructure/git/command.ts";
import { commits } from "../infrastructure/git/history.ts";
import { storageFor } from "./agent-storage.ts";
import { completeBrief } from "./interactive-brief.ts";
import type {
  AttachOptions,
  AttachResult,
  SandboxOptions,
} from "./outpost.types.ts";
import { createSandbox } from "./sandbox.ts";
import { createFileSandbox, isFileSandboxOptions } from "./file-sandbox.ts";
import type {
  FileSandboxOptions,
  FileAttachResult,
} from "./file-sandbox.types.ts";
import type { GitWorkspaceSandboxOptions } from "./file-workspace.types.ts";
import {
  isGitWorkspaceSandboxOptions,
  gitWorkspaceSandboxOptions,
} from "./workspace-source.ts";

export function attach(
  options: FileSandboxOptions & AttachOptions & RequiredAgent,
): Promise<FileAttachResult>;
export function attach(
  options: GitWorkspaceSandboxOptions & AttachOptions & RequiredAgent,
): Promise<AttachResult>;
export function attach(
  options: SandboxOptions & AttachOptions & RequiredAgent,
): Promise<AttachResult>;
export async function attach(
  options: (SandboxOptions | FileSandboxOptions | GitWorkspaceSandboxOptions) &
    AttachOptions &
    RequiredAgent,
): Promise<AttachResult | FileAttachResult> {
  if (isGitWorkspaceSandboxOptions(options))
    return attach(gitWorkspaceSandboxOptions(options));
  if (isFileAttachOptions(options)) {
    invariant(
      options.agent.kind === "cli" && options.agent.fileWorkspaces?.interactive,
      "Interactive CLI support for file workspaces has not been validated",
    );
    const sandbox = await createFileSandbox(options);
    let complete = false;
    try {
      const result = await sandbox.attach(options);
      complete = result.status === 0;
      return result;
    } finally {
      await sandbox.close({ preserve: !complete });
    }
  }
  options.signal?.throwIfAborted();
  invariant(
    options.agent.kind === "cli",
    "This harness does not support interactive attachment",
  );
  invariant(
    !options.continuation || options.agent.resumable !== false,
    "This adapter does not support continuation",
  );
  invariant(
    !options.continuation?.fork || options.agent.forkable !== false,
    "This adapter does not support automated fork",
  );
  validateBrief(options.brief, true);
  const brief = await completeBrief(options.brief, options.signal, options.ask);
  if (brief) options = { ...options, brief };
  if (options.continuation) {
    const storage = storageFor(options.agent);
    invariant(storage, "This adapter does not support native conversations");
    await storage.locate(
      options.continuation.id,
      options.workspace?.repository ?? options.repository ?? process.cwd(),
      options.conversationHome,
    );
  }
  const sandbox = await createSandbox(options);
  let successful = false;
  try {
    const baseline = (
      await git(sandbox.workspace.directory, ["rev-parse", "HEAD"])
    ).trim();
    const result = await sandbox.attach(options);
    const changes = await commits(
      sandbox.workspace.directory,
      baseline,
      options.limits?.collectMs,
    );
    if (result.status === 0) await sandbox.workspace.integrate();
    const disposal = await sandbox.close({ preserve: result.status !== 0 });
    successful = true;
    return {
      ...result,
      ...disposal,
      branch: sandbox.workspace.branch,
      directory: sandbox.workspace.directory,
      commits: changes,
    };
  } finally {
    if (!successful) await sandbox.close({ preserve: true });
  }
}

function isFileAttachOptions(
  options: (SandboxOptions | FileSandboxOptions) &
    AttachOptions &
    RequiredAgent,
): options is FileSandboxOptions & AttachOptions & RequiredAgent {
  return isFileSandboxOptions(options);
}
