// Compose structured inputs, conditions, local transformations and a bounded loop in a YAML workflow.
// Build Outpost, then run with Node.js 24+; the workflow performs no sandbox allocation or paid calls.

import type { TaskRecord } from "../../dist/index.js";
import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

test("structured recipe results and loop rounds", async () => {
  const result = await promisify(execFile)(process.execPath, [
    resolve(import.meta.dirname, "../../dist/cli/main.js"),
    "recipe",
    "run",
    "--file",
    resolve(import.meta.dirname, "recipe.yaml"),
    "--config",
    resolve(import.meta.dirname, "outpost.yaml"),
    "--json",
    "--input",
    'changes={"files":["a.ts","b.ts"],"approved":true}',
  ]);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "done");
  assert.equal(report.outputs.summarize.value.count, 2);
  assert.equal(report.outputs.verify.value.verified, true);
  assert.equal(
    report.tasks.find((task: TaskRecord) => task.key === "verify").rounds
      .length,
    2,
  );
  assert.equal(report.workspace, undefined);
  assert.equal(result.stderr, "");
});
