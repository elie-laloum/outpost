import type { Commit } from "../../domain/workspace.types.ts";
import { git } from "./command.ts";

export async function commits(
  cwd: string,
  baseline: string,
  deadlineMs?: number,
): Promise<Commit[]> {
  const lines = await git(
    cwd,
    ["log", "--format=%H%x00%s", `${baseline}..HEAD`],
    deadlineMs,
  );
  return lines
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [oid = "", subject = ""] = line.split("\0");
      return { oid, subject };
    });
}
