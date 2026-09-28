import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { test } from "node:test";
import { checkSpeculationIntegration, speculate } from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { emit, repository, scripted } from "../helpers.ts";

for (const mutation of ["head", "dirty"] as const) {
  test(
    `preflight and host reporting detect ${mutation} changes inside snapshot acquisition`,
    { skip: process.platform === "win32" },
    async (t) => {
      const repo = await repository(t);
      const baseline = (await git(repo, ["rev-parse", "HEAD"])).trim();
      await git(repo, ["checkout", "-b", "candidate"]);
      await writeFile(join(repo, "base.txt"), "candidate\n");
      await git(repo, ["commit", "-am", "candidate"]);
      await git(repo, ["checkout", "main"]);
      await git(repo, ["checkout", "-b", "host-update"]);
      await writeFile(join(repo, "base.txt"), "host\n");
      await git(repo, ["commit", "-am", "host"]);
      const updated = (await git(repo, ["rev-parse", "HEAD"])).trim();
      await git(repo, ["checkout", "main"]);
      const realGit = execFileSync("which", ["git"], {
        encoding: "utf8",
      }).trim();
      const bin = join(repo, ".outpost", "bin");
      const marker = join(bin, "changed");
      await mkdir(bin, { recursive: true });
      await writeFile(
        join(bin, "git"),
        `#!${process.execPath}
const { spawnSync } = require("node:child_process");
const { existsSync, writeFileSync } = require("node:fs");
const args = process.argv.slice(2);
const result = spawnSync(${JSON.stringify(realGit)}, args, { encoding: "utf8" });
if (process.cwd() === ${JSON.stringify(repo)} && args.includes(${JSON.stringify(mutation === "head" ? "HEAD^{commit}" : "--porcelain")}) && !existsSync(${JSON.stringify(marker)})) {
  writeFileSync(${JSON.stringify(marker)}, "changed");
  if (${JSON.stringify(mutation)} === "head") {
    const change = spawnSync(${JSON.stringify(realGit)}, ["reset", "--hard", ${JSON.stringify(updated)}], { encoding: "utf8" });
    if (change.status !== 0) throw new Error(change.stderr);
  } else {
    writeFileSync(${JSON.stringify(join(repo, "base.txt"))}, "uncommitted host change\\n");
  }
}
process.stdout.write(result.stdout ?? "");
process.stderr.write(result.stderr ?? "");
process.exitCode = result.status ?? 1;
`,
        { mode: 0o755 },
      );
      const previous = process.env.PATH;
      process.env.PATH = `${bin}${delimiter}${previous ?? ""}`;
      try {
        const result = await checkSpeculationIntegration(repo, "candidate");
        assert.equal(result.status, "blocked");
        assert.match(result.reason!, /changed during/);
        await git(repo, ["reset", "--hard", baseline]);
        await rm(marker);
        const race = await speculate({
          repository: repo,
          sandboxProvider: localSandboxProvider(),
          budget: {},
          candidates: [
            {
              key: "candidate",
              agent: scripted(emit("done")),
              request: { brief: { text: "fixture" } },
            },
          ],
          validate: () => true,
        });
        assert.equal(race.status, "winner");
        assert.equal(race.host.changed, true);
      } finally {
        if (previous === undefined) delete process.env.PATH;
        else process.env.PATH = previous;
      }
    },
  );
}
