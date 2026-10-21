import type { DispatchRequest, DispatchResult } from "./outpost.types.ts";
import { createSandbox } from "./sandbox.ts";
import { dispatchGit } from "./git-dispatch.ts";
import { dispatchFiles, isFileSandboxOptions } from "./file-sandbox.ts";
import type {
  FileDispatchRequest,
  FileDispatchResult,
} from "./file-sandbox.types.ts";
import type { GitDispatchRequest } from "./file-workspace.types.ts";
import {
  isGitWorkspaceSandboxOptions,
  gitWorkspaceSandboxOptions,
} from "./workspace-source.ts";

export function dispatch<T = undefined>(
  options: FileDispatchRequest<T>,
): Promise<FileDispatchResult<T>>;
export function dispatch<T = undefined>(
  options: GitDispatchRequest<T>,
): Promise<DispatchResult<T>>;
export function dispatch<T = undefined>(
  options: DispatchRequest<T>,
): Promise<DispatchResult<T>>;
export async function dispatch<T = undefined>(
  options: DispatchRequest<T> | FileDispatchRequest<T> | GitDispatchRequest<T>,
): Promise<DispatchResult<T> | FileDispatchResult<T>> {
  if (isGitWorkspaceSandboxOptions(options))
    return dispatch(gitWorkspaceSandboxOptions(options));
  if (isFileDispatchRequest(options)) return dispatchFiles(options);
  return dispatchGit(options, createSandbox);
}

function isFileDispatchRequest<T>(
  options: DispatchRequest<T> | FileDispatchRequest<T>,
): options is FileDispatchRequest<T> {
  return isFileSandboxOptions(options);
}
