// Observe a YAML recipe through allocation, task execution and cleanup using a local hub.
// Build Outpost, then run with Node.js 24+ and Git; this example makes no model calls.

import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const execute = promisify(execFile);

test("declared observation reaches stderr and the final report reaches stdout", async (t) => {
  const repository = await mkdtemp(join(tmpdir(), "outpost-observed-recipe-"));
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
  const result = await execute(process.execPath, [
    resolve(import.meta.dirname, "../../dist/cli/main.js"),
    "recipe",
    "run",
    "--file",
    resolve(import.meta.dirname, "recipe.yaml"),
    "--config",
    config,
  ]);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "done");
  assert.equal(report.outputs.hello.stdout, "Hello from the recipe\n");
  const events = result.stderr
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.ok(events.some((event) => event.source === "workflow"));
  assert.ok(events.some((event) => event.event.kind === "command-output"));
  assert.ok(events.some((event) => event.event.name === "repository.release"));
});
