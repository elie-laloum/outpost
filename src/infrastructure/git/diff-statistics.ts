import { OutpostError } from "../../domain/errors.ts";
import type { DiffChange } from "../../domain/diff-guard.types.ts";
import { executeProcess, requireSuccess } from "../process.ts";
import type { Executor } from "../process.types.ts";
import { gitDefaults } from "./git.constants.ts";

export function parseDiffStatistics(output: string): DiffChange[] {
  const invalid = () =>
    new OutpostError("guard", "Cannot inspect committed diff statistics", {
      reasons: ["inspection"],
    });
  if (!output) return [];
  if (!output.endsWith("\0")) throw invalid();
  const tokens = output.split("\0");
  tokens.pop();
  const changes: DiffChange[] = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!;
    const match = /^(\d+|-)\t(\d+|-)\t([^]*)$/.exec(token);
    if (!match) throw invalid();
    const [, added, removed, path] = match;
    const binary = added === "-" && removed === "-";
    if ((added === "-" || removed === "-") && !binary) throw invalid();
    const paths = path ? [path] : [tokens[++index], tokens[++index]];
    if (paths.some((entry) => !entry)) throw invalid();
    const addedLines = binary ? 0 : Number(added);
    const removedLines = binary ? 0 : Number(removed);
    if (
      !Number.isSafeInteger(addedLines) ||
      !Number.isSafeInteger(removedLines)
    )
      throw invalid();
    changes.push({
      paths: paths.filter(
        (entry): entry is string => typeof entry === "string",
      ),
      added: addedLines,
      removed: removedLines,
      binary,
    });
  }
  return changes;
}

export async function collectDiffStatistics(
  repository: string,
  baseline: string,
  candidateCommit: string,
  deadlineMs: number = gitDefaults.deadlineMs,
  executor: Executor = executeProcess,
): Promise<DiffChange[]> {
  let characters = 0;
  const result = await requireSuccess(
    {
      executable: "git",
      arguments: [
        "-c",
        `core.hooksPath=${process.platform === "win32" ? "NUL" : "/dev/null"}`,
        "-c",
        "diff.renameLimit=0",
        "-c",
        "diff.algorithm=myers",
        "diff",
        "--numstat",
        "-z",
        "--find-renames=50%",
        "--no-ext-diff",
        "--no-textconv",
        "--ignore-submodules=none",
        baseline,
        candidateCommit,
        "--",
      ],
      directory: repository,
      deadlineMs,
      retain: gitDefaults.retainBytes,
      variables: { LC_ALL: "C", GIT_TERMINAL_PROMPT: "0" },
      observe(channel, text) {
        if (channel !== "stdout") return;
        characters += text.length;
        if (characters > gitDefaults.retainBytes)
          throw new OutpostError(
            "guard",
            "Committed diff statistics exceeded the output limit",
            { reasons: ["inspection"] },
          );
      },
    },
    executor,
  );
  if (result.stdout.length >= gitDefaults.retainBytes)
    throw new OutpostError(
      "guard",
      "Committed diff statistics reached the output limit",
      { reasons: ["inspection"] },
    );
  return parseDiffStatistics(result.stdout);
}
