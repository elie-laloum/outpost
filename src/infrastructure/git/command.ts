import { requireSuccess } from "../process.ts";
import { gitDefaults } from "./git.constants.ts";

export async function git(
  cwd: string,
  args: readonly string[],
  deadlineMs: number = gitDefaults.deadlineMs,
  stdin?: string,
): Promise<string> {
  const result = await requireSuccess({
    executable: "git",
    arguments: [
      "-c",
      "core.hooksPath=" + (process.platform === "win32" ? "NUL" : "/dev/null"),
      ...args,
    ],
    directory: cwd,
    variables: { LC_ALL: "C", GIT_TERMINAL_PROMPT: "0" },
    deadlineMs,
    retain: gitDefaults.retainBytes,
    ...(stdin === undefined ? {} : { stdin }),
  });
  return result.stdout;
}
