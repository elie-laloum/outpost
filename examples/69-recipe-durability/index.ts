// Persist an artifact, pause for approval and resume a YAML recipe in another Node.js process.
// Build Outpost, then run with Node.js 24+; this example uses temporary storage without agents or sandboxes.

import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createRecipeRuntime } from "../../dist/recipes.js";

test("persist, review and resume a recipe", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-example-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = resolve(import.meta.dirname, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  const source = await readFile(
    resolve(import.meta.dirname, "outpost.yaml"),
    "utf8",
  );
  await writeFile(
    config,
    source.replace(
      "repository: ../..",
      `repository: ${JSON.stringify(resolve(import.meta.dirname, "../.."))}`,
    ),
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const paused = await runtime.run();
  assert.equal(paused.status, "paused", JSON.stringify(paused.errors));
  assert.equal(paused.workspace, undefined);
  const decision = join(directory, "decision.json");
  await writeFile(
    decision,
    JSON.stringify({
      executionId: paused.executionId,
      key: "review",
      requestId: paused.tasks.find((task) => task.key === "review")!.pause!.id,
      action: "approve",
      actor: "maintainer",
      reason: "Evidence checked",
    }),
  );
  const resumed = await promisify(execFile)(process.execPath, [
    resolve(import.meta.dirname, "../../dist/cli/main.js"),
    "recipe",
    "decide",
    "--file",
    file,
    "--config",
    config,
    "--run-id",
    "reviewed-artifact",
    "--decision",
    decision,
    "--json",
  ]);
  const report = JSON.parse(resumed.stdout);
  assert.equal(report.status, "done");
  assert.equal(report.outputs.publish.value.id, paused.outputs.evidence!.id);
  assert.equal(resumed.stderr, "");
  assert.equal(
    (await runtime.status("reviewed-artifact"))?.report?.status,
    "done",
  );
});
