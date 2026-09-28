import type { CommandResult, Variables } from "../domain/command.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type {
  RecordedCommit,
  WorkspaceCommitsEvent,
} from "../domain/replay.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { ReplayWorkspaceContext } from "./replay-workspace.types.ts";

export async function replayWorkspace(
  lease: SandboxLease,
  changes: WorkspaceCommitsEvent,
  context: ReplayWorkspaceContext,
): Promise<void> {
  if ("unavailable" in changes)
    return context.diverge({
      kind: "unrecorded",
      expected: changes.unavailable,
    });
  const invoke = (
    args: readonly string[],
    stdin?: string,
    variables: Variables = {},
  ): Promise<CommandResult> =>
    lease.invoke({
      executable: "git",
      arguments: args,
      directory: lease.root,
      ...(stdin === undefined ? {} : { stdin }),
      variables: { ...variables, LC_ALL: "C", GIT_TERMINAL_PROMPT: "0" },
      deadlineMs: context.deadlineMs,
      ...(context.signal ? { signal: context.signal } : {}),
    });
  const output = async (
    args: readonly string[],
    stdin?: string,
    variables?: Variables,
  ): Promise<string> => {
    const result = await invoke(args, stdin, variables);
    if (result.status !== 0)
      throw new OutpostError(
        "process",
        `git ${args[0]} failed while replaying workspace commits`,
        { ...result },
      );
    return result.stdout.trim();
  };
  const tree = await output(["rev-parse", "HEAD^{tree}"]);
  if (tree !== changes.baseline.tree)
    context.diverge({
      kind: "baseline",
      expected: changes.baseline.tree,
      actual: tree,
    });
  for (const commit of changes.commits) {
    if (commit.patch) {
      const applied = await invoke(
        ["apply", "--index", "--binary", "--whitespace=nowarn", "-"],
        commit.patch,
      );
      if (applied.status !== 0)
        context.diverge(
          {
            kind: "tree",
            commit: commit.oid,
            expected: commit.tree,
            actual: applied.stderr.trim(),
          },
          true,
        );
    }
    const actual = await output(["write-tree"]);
    if (actual !== commit.tree)
      context.diverge({
        kind: "tree",
        commit: commit.oid,
        expected: commit.tree,
        actual,
      });
    const parent = await output(["rev-parse", "HEAD"]);
    const created = await output(
      ["commit-tree", actual, "-p", parent],
      commit.message,
      identity(commit),
    );
    await output([
      "update-ref",
      "-m",
      "outpost replay",
      "HEAD",
      created,
      parent,
    ]);
  }
}

function identity(commit: RecordedCommit): Variables {
  return {
    GIT_AUTHOR_NAME: commit.author.name,
    GIT_AUTHOR_EMAIL: commit.author.email,
    GIT_AUTHOR_DATE: commit.author.date,
    GIT_COMMITTER_NAME: commit.committer.name,
    GIT_COMMITTER_EMAIL: commit.committer.email,
    GIT_COMMITTER_DATE: commit.committer.date,
  };
}
