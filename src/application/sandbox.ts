import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { Sandbox, SandboxOptions } from "./outpost.types.ts";
import { createPreparedSandbox as prepareSandbox } from "./git-sandbox.ts";
import { openWorkspace } from "./workspace.ts";
import { createFileSandbox, isFileSandboxOptions } from "./file-sandbox.ts";
import type { FileSandboxOptions, FileSandbox } from "./file-sandbox.types.ts";
import type { GitWorkspaceSandboxOptions } from "./file-workspace.types.ts";
import {
  isGitWorkspaceSandboxOptions,
  gitWorkspaceSandboxOptions,
} from "./workspace-source.ts";

export function createSandbox(
  options: FileSandboxOptions,
): Promise<FileSandbox>;
export function createSandbox(
  options: GitWorkspaceSandboxOptions,
): Promise<Sandbox>;
export function createSandbox(options?: SandboxOptions): Promise<Sandbox>;
export async function createSandbox(
  options:
    SandboxOptions | FileSandboxOptions | GitWorkspaceSandboxOptions = {},
): Promise<Sandbox | FileSandbox> {
  return createSandboxForOptions(options);
}

export async function createSandboxForOptions(
  options: SandboxOptions | FileSandboxOptions | GitWorkspaceSandboxOptions,
): Promise<Sandbox | FileSandbox> {
  if (isGitWorkspaceSandboxOptions(options))
    return createPreparedSandbox(gitWorkspaceSandboxOptions(options));
  if (isFileSandboxOptions(options)) return createFileSandbox(options);
  return createPreparedSandbox(options);
}

export function createPreparedSandbox(
  options: SandboxOptions,
  prepare?: (lease: SandboxLease) => Promise<void>,
): Promise<Sandbox> {
  return prepareSandbox(options, openWorkspace, prepare);
}
