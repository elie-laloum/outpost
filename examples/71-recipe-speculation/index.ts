// Compose experimental speculation from YAML and keep the winning branch without integrating it.
// Build Outpost and run with Node.js 24+; the agent is scripted and all Git work is temporary.

import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readFile, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { createRecipeRuntime } from "../../dist/recipes.js";

test("YAML candidate selection preserves the host branch", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-yaml-speculation-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const git = (...arguments_: string[]) =>
    promisify(execFile)("git", arguments_, { cwd: directory });
  await git("init", "-b", "main");
  await git("config", "user.name", "Outpost Example");
  await git("config", "user.email", "example@outpost.invalid");
  await writeFile(join(directory, "base.txt"), "base");
  await git("add", ".");
  await git("commit", "-m", "Initial");
  const before = (await git("rev-parse", "HEAD")).stdout;
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await copyFile(resolve(import.meta.dirname, "recipe.yaml"), file);
  const source = await readFile(
    resolve(import.meta.dirname, "outpost.yaml"),
    "utf8",
  );
  await writeFile(
    config,
    source.replaceAll(
      "./components.ts",
      resolve(import.meta.dirname, "components.ts"),
    ),
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.equal(report.usage?.tokens.input, 2);
  const selection = report.outputs.choose?.value;
  assert.ok(
    selection && typeof selection === "object" && "status" in selection,
  );
  assert.equal(selection.status, "winner");
  assert.equal((await git("rev-parse", "HEAD")).stdout, before);
});
