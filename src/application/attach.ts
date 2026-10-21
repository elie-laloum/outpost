import type { RequiredAgent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import type {
  AttachOptions,
  AttachResult,
  SandboxOptions,
} from "./outpost.types.ts";
import { createSandbox } from "./sandbox.ts";
import { attachGit } from "./git-attach.ts";
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
  return attachGit(options, createSandbox);
}

function isFileAttachOptions(
  options: (SandboxOptions | FileSandboxOptions) &
    AttachOptions &
    RequiredAgent,
): options is FileSandboxOptions & AttachOptions & RequiredAgent {
  return isFileSandboxOptions(options);
}
