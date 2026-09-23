import { createHash, randomUUID } from "node:crypto";
import { appendFile, mkdir, open, readFile, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import type {
  BranchPolicy,
  Commit,
  Disposal,
  StageLimits,
  WorkspaceRecord,
} from "../domain/ports.ts";
import { copySelected, directory, inside } from "./files.ts";
import { executeProcess, requireSuccess } from "./process.ts";

export async function git(
  cwd: string,
  args: readonly string[],
  deadlineMs = 30_000,
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
    deadlineMs,
    retain: 16_777_216,
    ...(stdin === undefined ? {} : { stdin }),
  });
  return result.stdout;
}

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

async function lock(root: string, key: string): Promise<() => Promise<void>> {
  const folder = join(root, ".outpost", "locks");
  await mkdir(folder, { recursive: true });
  const path = join(
    folder,
    `${createHash("sha256").update(key).digest("hex").slice(0, 20)}.json`,
  );
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const file = await open(path, "wx", 0o600);
      await file.writeFile(
        JSON.stringify({ pid: process.pid, nonce: randomUUID() }),
      );
      await file.close();
      return () => rm(path, { force: true });
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code !== "EEXIST") throw cause;
      const owner = JSON.parse(await readFile(path, "utf8")) as {
        pid?: number;
      };
      let alive = true;
      try {
        if (!owner.pid) throw new Error();
        process.kill(owner.pid, 0);
      } catch (error) {
        alive = (error as NodeJS.ErrnoException).code === "EPERM";
      }
      if (alive)
        throw new OutpostError(
          "conflict",
          `Workspace is already in use: ${key}`,
          { lock: path, pid: owner.pid },
        );
      await rm(path, { force: true });
    }
  }
  throw new OutpostError("conflict", "Unable to acquire workspace lock");
}

export interface WorkspaceLease extends WorkspaceRecord {
  integrate(): Promise<void>;
  dispose(preserve?: boolean): Promise<Disposal>;
}

export async function acquireWorkspace(options: {
  repository?: string;
  branch?: BranchPolicy;
  copies?: readonly string[];
  limits?: StageLimits;
}): Promise<WorkspaceLease> {
  const requested = await directory(options.repository);
  const root = (
    await git(
      requested,
      ["rev-parse", "--show-toplevel"],
      options.limits?.gitMs,
    )
  ).trim();
  const repository = await directory(root);
  const exclude = (
    await git(repository, [
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      "info/exclude",
    ])
  ).trim();
  const exclusions = await readFile(exclude, "utf8").catch(() => "");
  const patterns = [
    "/.outpost/workspaces/",
    "/.outpost/locks/",
    "/.outpost/recovery/",
    "/.outpost/logs/",
  ];
  const missing = patterns.filter(
    (pattern) => !exclusions.split(/\r?\n/).includes(pattern),
  );
  if (missing.length) {
    await mkdir(dirname(exclude), { recursive: true });
    await appendFile(exclude, `\n${missing.join("\n")}\n`);
  }
  const policy = options.branch ?? { mode: "current" };
  const baseBranch = (
    await git(repository, ["symbolic-ref", "--quiet", "--short", "HEAD"]).catch(
      () => "",
    )
  ).trim();
  if (policy.mode === "integrate" && !baseBranch)
    throw new OutpostError(
      "workspace",
      "Automatic integration requires an attached host branch",
    );
  if (policy.mode === "current" && options.copies?.length)
    throw new OutpostError(
      "configuration",
      "Copied inputs require a separate workspace",
    );
  const branch =
    policy.mode === "current"
      ? baseBranch || "HEAD"
      : policy.mode === "named"
        ? policy.name
        : `outpost/job-${randomUUID()}`;
  if (policy.mode !== "current")
    await git(repository, ["check-ref-format", "--branch", branch]);
  const unlock = await lock(
    repository,
    policy.mode === "current" ? repository : branch,
  );
  let workdir = repository;
  let disposal: Promise<Disposal> | undefined;
  try {
    if (policy.mode !== "current") {
      const hash = createHash("sha256")
        .update(branch)
        .digest("hex")
        .slice(0, 12);
      const expected = join(repository, ".outpost", "workspaces", hash);
      const list = await git(repository, [
        "worktree",
        "list",
        "--porcelain",
        "-z",
      ]);
      const entries = list.split("\0\0").map((item) => item.split("\0"));
      const existing = entries.find((fields) =>
        fields.includes(`branch refs/heads/${branch}`),
      );
      if (existing) {
        workdir = existing
          .find((field) => field.startsWith("worktree "))!
          .slice(9);
        if (resolve(workdir) !== resolve(expected))
          throw new OutpostError(
            "conflict",
            `Branch ${branch} is checked out elsewhere`,
            { path: workdir },
          );
        await directory(workdir);
      } else {
        await mkdir(join(repository, ".outpost", "workspaces"), {
          recursive: true,
        });
        const branchExists = await executeProcess({
          executable: "git",
          arguments: [
            "show-ref",
            "--verify",
            "--quiet",
            `refs/heads/${branch}`,
          ],
          directory: repository,
        });
        const from = policy.from ?? "HEAD";
        const oid = (
          await git(repository, [
            "rev-parse",
            "--verify",
            "--end-of-options",
            `${from}^{commit}`,
          ])
        ).trim();
        await git(
          repository,
          [
            "worktree",
            "add",
            ...(branchExists.status === 0 ? [] : ["-b", branch]),
            expected,
            branchExists.status === 0 ? branch : oid,
          ],
          options.limits?.gitMs,
        );
        workdir = expected;
      }
    }
    await copySelected(
      repository,
      workdir,
      options.copies ?? [],
      options.limits?.copyMs,
    );
    const baseline = (await git(workdir, ["rev-parse", "HEAD"])).trim();
    const gitDir = (
      await git(workdir, ["rev-parse", "--absolute-git-dir"])
    ).trim();
    const common = (
      await git(workdir, [
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      ])
    ).trim();
    return {
      repository,
      directory: workdir,
      branch,
      baseBranch,
      baseline,
      policy,
      gitDirectories: [...new Set([gitDir, common])],
      async integrate() {
        if (policy.mode !== "integrate") return;
        const current = (
          await git(repository, ["symbolic-ref", "--short", "HEAD"])
        ).trim();
        if (current !== baseBranch)
          throw new OutpostError(
            "conflict",
            "Host branch changed during the job",
            { expected: baseBranch, current, directory: workdir },
          );
        const releaseMerge = await lock(repository, `merge:${baseBranch}`);
        try {
          await git(
            repository,
            ["merge", "--no-edit", branch],
            options.limits?.mergeMs,
          );
        } catch (cause) {
          throw new OutpostError(
            "conflict",
            "Automatic integration failed; workspace retained",
            { directory: workdir, branch },
            cause,
          );
        } finally {
          await releaseMerge();
        }
      },
      dispose(preserve = false) {
        if (disposal) return disposal;
        disposal = (async () => {
          try {
            if (policy.mode === "current") return {};
            if (preserve) return { retainedDirectory: workdir };
            const dirty = await git(workdir, [
              "status",
              "--porcelain",
              "--untracked-files=normal",
            ]);
            if (dirty.trim()) return { retainedDirectory: workdir };
            if (!inside(join(repository, ".outpost", "workspaces"), workdir))
              throw new OutpostError(
                "workspace",
                "Refusing to remove an unmanaged workspace",
              );
            await git(repository, ["worktree", "remove", workdir]);
            if (policy.mode === "integrate")
              await git(repository, ["branch", "-d", branch]).catch(
                () => undefined,
              );
            return {};
          } finally {
            await unlock();
          }
        })();
        return disposal;
      },
    };
  } catch (error) {
    await unlock();
    throw error;
  }
}
