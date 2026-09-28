import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  RecordedCommit,
  RecordedIdentity,
  RecordedRevision,
  WorkspaceCommitsEvent,
} from "../../domain/replay.types.ts";
import { git } from "./command.ts";
import { gitDefaults } from "./git.constants.ts";
import {
  commitIdentity,
  replayRecordingDefaults,
} from "./replay-commits.constants.ts";

export async function recordWorkspaceCommits(
  directory: string,
  baseline: string,
  deadlineMs: number = gitDefaults.deadlineMs,
  maxBytes: number = replayRecordingDefaults.maxBytes,
): Promise<WorkspaceCommitsEvent> {
  const run = (
    args: readonly string[],
    stdin?: string,
    variables?: Readonly<Record<string, string>>,
  ) => git(directory, args, deadlineMs, stdin, variables);
  const start: RecordedRevision = {
    commit: baseline,
    tree: (await run(["rev-parse", `${baseline}^{tree}`])).trim(),
  };
  const history = (
    await run(["rev-list", "--reverse", "--parents", `${baseline}..HEAD`])
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split(" "));
  const head = (await run(["rev-parse", "HEAD"])).trim();
  const unavailable = (reason: string): WorkspaceCommitsEvent => ({
    kind: "workspace-commits",
    baseline: start,
    unavailable: reason,
  });
  let previous = baseline;
  for (const [oid, ...parents] of history) {
    if (parents.length !== 1 || parents[0] !== previous)
      return unavailable(
        "Recorded history is not a linear descendant of the baseline",
      );
    previous = oid!;
  }
  if (previous !== head)
    return unavailable("Recorded history does not end at the workspace HEAD");
  const staging = await mkdtemp(join(tmpdir(), "outpost-replay-"));
  try {
    const attributes = join(staging, "attributes");
    await writeFile(attributes, replayRecordingDefaults.attributes);
    const index = { GIT_INDEX_FILE: join(staging, "index") };
    const commits: RecordedCommit[] = [];
    let remaining = maxBytes;
    for (const [oid, parent] of history) {
      const recorded = parseCommit(
        oid!,
        await run(["cat-file", "commit", oid!]),
      );
      if (typeof recorded === "string") return unavailable(recorded);
      const patch = await run([
        "-c",
        `core.attributesFile=${attributes}`,
        "diff-tree",
        "-p",
        "--binary",
        "--full-index",
        "--no-renames",
        "--no-color",
        parent!,
        oid!,
      ]);
      remaining -=
        Buffer.byteLength(patch) + Buffer.byteLength(recorded.message);
      if (remaining < 0)
        return unavailable(`Recorded changes exceed ${maxBytes} bytes`);
      await run(["read-tree", parent!], undefined, index);
      if (patch)
        await run(
          ["apply", "--cached", "--binary", "--whitespace=nowarn", "-"],
          patch,
          index,
        );
      const tree = (await run(["write-tree"], undefined, index)).trim();
      if (tree !== recorded.tree)
        return unavailable(
          `The recorded patch does not reproduce commit ${oid}`,
        );
      commits.push({ ...recorded, patch });
    }
    return { kind: "workspace-commits", baseline: start, commits };
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

function parseCommit(
  oid: string,
  raw: string,
): Omit<RecordedCommit, "patch"> | string {
  const separator = raw.indexOf("\n\n");
  const headers = (separator < 0 ? raw : raw.slice(0, separator)).split("\n");
  const message = separator < 0 ? "" : raw.slice(separator + 2);
  const field = (name: string) =>
    headers.find((line) => line.startsWith(`${name} `))?.slice(name.length + 1);
  if (field("encoding") !== undefined)
    return `Commit ${oid} uses a non-UTF-8 message encoding`;
  const tree = field("tree");
  const author = identity(field("author"));
  const committer = identity(field("committer"));
  if (!tree || !author || !committer) return `Commit ${oid} is malformed`;
  return { oid, tree, author, committer, message };
}

function identity(value: string | undefined): RecordedIdentity | undefined {
  const match = value === undefined ? null : commitIdentity.exec(value);
  if (!match) return undefined;
  return { name: match[1]!, email: match[2]!, date: match[3]! };
}
