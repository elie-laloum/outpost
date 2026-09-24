import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { gitDefaults } from "./git.constants.ts";

export async function verificationGit(
  directory: string,
  args: readonly string[],
  deadlineMs: number = gitDefaults.deadlineMs,
  signal?: AbortSignal,
): Promise<string> {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.toUpperCase().startsWith("GIT_"),
    ),
  );
  const result = await promisify(execFile)(
    "git",
    [
      "-c",
      `core.hooksPath=${process.platform === "win32" ? "NUL" : "/dev/null"}`,
      "-c",
      "core.fsmonitor=false",
      "-c",
      "maintenance.auto=false",
      "-c",
      "gc.auto=0",
      ...args,
    ],
    {
      cwd: directory,
      env: {
        ...environment,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
        GIT_ATTR_NOSYSTEM: "1",
        GIT_NO_LAZY_FETCH: "1",
        GIT_ALLOW_PROTOCOL: "file",
        GIT_TERMINAL_PROMPT: "0",
        GIT_OPTIONAL_LOCKS: "0",
        LC_ALL: "C",
      },
      timeout: deadlineMs,
      ...(signal ? { signal } : {}),
      maxBuffer: gitDefaults.retainBytes,
      encoding: "utf8",
      windowsHide: true,
    },
  );
  return result.stdout;
}
