import { executeProcessWithEnvironment, requireSuccess } from "../process.ts";
import { OutpostError } from "../../domain/errors.ts";
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
  let bytes = 0;
  const result = await requireSuccess(
    {
      executable: "git",
      arguments: [
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
      directory,
      deadlineMs,
      ...(signal ? { signal } : {}),
      retain: gitDefaults.retainBytes,
      observe(_channel, text) {
        bytes += Buffer.byteLength(text);
        if (bytes > gitDefaults.retainBytes)
          throw new OutpostError(
            "process",
            "Git verification output exceeds its byte limit",
          );
      },
    },
    (command) =>
      executeProcessWithEnvironment(command, {
        ...environment,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
        GIT_ATTR_NOSYSTEM: "1",
        GIT_NO_LAZY_FETCH: "1",
        GIT_ALLOW_PROTOCOL: "file",
        GIT_TERMINAL_PROMPT: "0",
        GIT_OPTIONAL_LOCKS: "0",
        LC_ALL: "C",
      }),
  );
  return result.stdout;
}
