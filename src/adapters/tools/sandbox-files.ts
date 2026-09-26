import { createHash } from "node:crypto";
import { lstat, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, posix } from "node:path";
import { normalizeResourcePath } from "../../domain/permissions.ts";
import type { CommandResult } from "../../domain/command.types.ts";
import type { HarnessToolContext } from "../../domain/tool.types.ts";
import { TOOL_LIMITS } from "./tools.constants.ts";
import type { SandboxFile } from "./tools.types.ts";

export function repositoryPath(path: string): string {
  const normalized = normalizeResourcePath(path);
  if (normalized === undefined)
    throw new Error(`Path must stay inside the repository: ${path}`);
  return normalized;
}

export function sandboxPath(context: HarnessToolContext, path: string): string {
  const normalized = repositoryPath(path);
  return normalized
    ? posix.join(context.sandbox.root, normalized)
    : context.sandbox.root;
}

export async function withStaging<T>(
  operation: (directory: string) => Promise<T>,
): Promise<T> {
  const directory = await mkdtemp(join(tmpdir(), "outpost-tool-"));
  try {
    return await operation(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function downloadFile(
  context: HarnessToolContext,
  path: string,
  staged: string,
): Promise<SandboxFile> {
  await context.sandbox.download(sandboxPath(context, path), staged, {
    signal: context.signal,
  });
  const info = await lstat(staged);
  if (info.isSymbolicLink())
    throw new Error(`${path} is a symbolic link; links are not followed`);
  if (!info.isFile()) throw new Error(`${path} is not a regular file`);
  if (info.size > TOOL_LIMITS.fileBytes)
    throw new Error(
      `${path} has ${info.size} bytes; the limit is ${TOOL_LIMITS.fileBytes}`,
    );
  const bytes = await readFile(staged);
  if (bytes.subarray(0, TOOL_LIMITS.binaryProbeBytes).includes(0))
    throw new Error(`${path} looks binary and cannot be read as text`);
  return { staged, bytes };
}

export function digest(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function commandOutput(result: CommandResult): string {
  const note = (text: string) =>
    text.length >= TOOL_LIMITS.commandCharacters
      ? `[output truncated to the last ${TOOL_LIMITS.commandCharacters} characters]\n${text}`
      : text;
  return [
    `exit status: ${result.status}`,
    ...(result.stdout ? ["--- stdout ---", note(result.stdout)] : []),
    ...(result.stderr ? ["--- stderr ---", note(result.stderr)] : []),
  ].join("\n");
}

export function anywhere(pattern: string): string {
  return pattern.includes("/") ? pattern : `**/${pattern}`;
}
