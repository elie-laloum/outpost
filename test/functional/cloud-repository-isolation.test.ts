import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createSandbox, OutpostError } from "../../src/index.ts";
import { git } from "../../src/infrastructure/git.ts";
import {
  daytonaRepositoryFixture,
  vercelRepositoryFixture,
} from "../fixtures/cloud-repository.ts";
import { repository } from "../helpers.ts";

for (const [name, fixture] of [
  ["Vercel", vercelRepositoryFixture],
  ["Daytona", daytonaRepositoryFixture],
] as const) {
  for (const mode of [undefined, "isolated"] as const)
    test(
      `${name} ${mode ?? "default"} synchronizes private Git without importing configuration, hooks or unrelated refs`,
      { skip: process.platform !== "linux" },
      async (t) => {
        const host = await repository(t);
        const remote = await mkdtemp(join(tmpdir(), "outpost-cloud-git-"));
        t.after(() => rm(remote, { recursive: true, force: true }));
        await git(host, ["config", "outpost.hostOnly", "private"]);
        const hook = join(host, ".git", "hooks", "pre-commit");
        await writeFile(hook, "host hook\n");
        const provider = fixture(remote, mode);
        assert.equal(provider.placement, "remote");
        const box = await createSandbox({
          sandboxProvider: provider,
          repository: host,
          branch: { mode: "named", name: "cloud-isolated" },
        });
        t.after(() => box.close({ preserve: true }));
        const changed = await box.command({
          executable: "sh",
          arguments: [
            "-c",
            'test -d .git && ! git config --get outpost.hostOnly && test ! -e .git/hooks/pre-commit && git config outpost.hostOnly guest && printf "guest hook\\n" > .git/hooks/pre-commit && git update-ref refs/heads/guest-only HEAD && printf "committed\\n" > committed.txt && git add committed.txt && git -c core.hooksPath=/dev/null commit -m cloud && printf "dirty\\n" >> base.txt && printf "untracked\\n" > extra.txt',
          ],
        });
        assert.equal(changed.status, 0, changed.stderr);
        const workspace = box.workspace.directory;
        assert.equal(
          await readFile(join(workspace, "committed.txt"), "utf8"),
          "committed\n",
        );
        assert.equal(
          await readFile(join(workspace, "base.txt"), "utf8"),
          "base\ndirty\n",
        );
        assert.equal(
          await readFile(join(workspace, "extra.txt"), "utf8"),
          "untracked\n",
        );
        assert.equal(
          await git(workspace, ["rev-parse", "HEAD"]),
          await git(remote, ["rev-parse", "HEAD"]),
        );
        assert.equal(
          (await git(host, ["config", "--get", "outpost.hostOnly"])).trim(),
          "private",
        );
        assert.equal(await readFile(hook, "utf8"), "host hook\n");
        await assert.rejects(
          git(host, ["show-ref", "--verify", "refs/heads/guest-only"]),
        );
        assert.equal(await readFile(join(host, "base.txt"), "utf8"), "base\n");
        const repeated = await box.command({
          executable: "git",
          arguments: ["status", "--porcelain"],
        });
        assert.equal(repeated.status, 0);
        assert.match(repeated.stdout, /extra.txt/);
      },
    );

  test(
    `${name} isolated synchronization preserves concurrent host edits and recovery files`,
    { skip: process.platform !== "linux" },
    async (t) => {
      const host = await repository(t);
      const remote = await mkdtemp(join(tmpdir(), "outpost-cloud-conflict-"));
      t.after(() => rm(remote, { recursive: true, force: true }));
      const box = await createSandbox({
        sandboxProvider: fixture(remote, "isolated"),
        repository: host,
        branch: { mode: "named", name: "cloud-conflict" },
      });
      t.after(() => box.close({ preserve: true }));
      const base = join(box.workspace.directory, "base.txt");
      await writeFile(base, "concurrent host edit\n");
      let recovery = "";
      await assert.rejects(
        box.command({
          executable: "sh",
          arguments: ["-c", 'printf "remote edit\\n" > base.txt'],
        }),
        (error: unknown) => {
          assert.ok(error instanceof OutpostError);
          assert.equal(error.code, "workspace");
          assert.ok(error.cause instanceof OutpostError);
          assert.equal(
            error.cause.message,
            "Host workspace changed while the remote sandbox was active",
          );
          assert.equal(typeof error.details.recovery, "string");
          recovery = String(error.details.recovery);
          return true;
        },
      );
      assert.equal(await readFile(base, "utf8"), "concurrent host edit\n");
      assert.ok((await stat(recovery)).isDirectory());
    },
  );
}
