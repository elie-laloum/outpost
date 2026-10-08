// Compose a named sandbox provider, lifecycle preparation and an explicit environment reference in YAML.
// Build Outpost, then run with Node.js 24+ and Git; the temporary local repository needs no account.

import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const execute = promisify(execFile);

test("native options prepare the workspace and protect environment values", async (t) => {
  const repository = await mkdtemp(
    join(tmpdir(), "outpost-recipe-components-"),
  );
  t.after(() => rm(repository, { recursive: true, force: true }));
  const git = (...args: string[]) => execute("git", args, { cwd: repository });
  await git("init", "-b", "main");
  await git("config", "user.name", "Outpost example");
  await git("config", "user.email", "example@example.invalid");
  await writeFile(join(repository, "initial"), "initial");
  await git("add", ".");
  await git("commit", "-m", "Initial");
  const configuration = await readFile(
    new URL("./outpost.yaml", import.meta.url),
    "utf8",
  );
  const config = join(repository, "outpost.yaml");
  await writeFile(
    config,
    configuration.replace("repository: ../..", "repository: ."),
  );
  const result = await execute(
    process.execPath,
    [
      resolve(import.meta.dirname, "../../dist/cli/main.js"),
      "recipe",
      "run",
      "--file",
      resolve(import.meta.dirname, "recipe.yaml"),
      "--config",
      config,
    ],
    { env: { ...process.env, OUTPOST_RECIPE_DEMO_VALUE: "fixture-secret" } },
  );
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "done");
  assert.equal(report.outputs.check.stdout, "[REDACTED]\n");
  assert.equal(result.stderr, "");
  assert.equal(await readFile(join(repository, "prepared"), "utf8"), "ready");
});
