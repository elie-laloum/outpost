// Run a reusable YAML recipe with typed inputs, step outputs, scripted commits and retries.
// Build Outpost, then run with Node.js 24+ and Git; no account or network is required.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

test("YAML recipe CLI commits the fix after one retry and runs its check", async (t) => {
  const repository = await mkdtemp(join(tmpdir(), "outpost-recipe-example-"));
  t.after(() => rm(repository, { recursive: true, force: true }));
  const run = promisify(execFile);
  const git = (...args: string[]) => run("git", args, { cwd: repository });
  await git("init", "-b", "main");
  await git("config", "user.name", "Outpost demo");
  await git("config", "user.email", "demo@example.invalid");
  await writeFile(join(repository, "base.txt"), "base\n");
  await git("add", ".");
  await git("commit", "-m", "Initial");
  const output = await run(
    process.execPath,
    [
      resolve(import.meta.dirname, "../../dist/cli/main.js"),
      "recipe",
      "run",
      "--file",
      join(import.meta.dirname, "recipe.yaml"),
      "--config",
      join(import.meta.dirname, "outpost.recipe.ts"),
      "--input",
      "goal=Handle empty parser input",
      "--json",
    ],
    {
      cwd: import.meta.dirname,
      env: { ...process.env, OUTPOST_RECIPE_REPOSITORY: repository },
    },
  );
  const report = JSON.parse(output.stdout);
  assert.equal(report.status, "done");
  assert.deepEqual(
    report.tasks.map(
      (task: { key: string; status: string; attempts: number }) => [
        task.key,
        task.status,
        task.attempts,
      ],
    ),
    [
      ["fix", "done", 2],
      ["verify", "done", 1],
      ["review", "done", 1],
    ],
  );
  assert.equal(report.outputs.review.text, "Review complete");
  assert.equal(report.usage.tokens.input, 10);
  assert.equal(report.usage.tokens.output, 5);
  assert.equal(
    await readFile(join(repository, "src/p.ts"), "utf8"),
    "export const parse = () => true;\n",
  );
  assert.match((await git("log", "-1", "--format=%s")).stdout, /fix: parser/);
});
