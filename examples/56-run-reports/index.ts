// Offline model, real local commands and Git commits; no credentials or paid calls.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessShellTools,
  dispatch,
} from "@elie-laloum/outpost";
import type { RunReport } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { demoRepository } from "../shared/repository.ts";
import { createDemoModel } from "./model.ts";

const repository = demoRepository(import.meta.dirname);
const agent = createAgent({
  model: "demo",
  harness: createHarness({
    modelProvider: createDemoModel(),
    tools: [createHarnessShellTools()],
  }),
});
const result = await dispatch({
  repository,
  agent,
  sandboxProvider: createLocalSandboxProvider(),
  branch: { mode: "integrate" },
  brief: {
    text: "Update and commit the README, recording the deliberately failed check.",
  },
  prices: {
    currency: "EUR",
    models: { demo: { input: 1, cached: 0.5, output: 2 } },
  },
  logging: false,
});
const directory = join(import.meta.dirname, "state");
await mkdir(directory, { recursive: true });
await writeFile(
  join(directory, "run-report.md"),
  result.report({ format: "markdown" }),
);
await writeFile(
  join(directory, "run-report.json"),
  result.report({ format: "json" }),
);
const report: RunReport = JSON.parse(result.report({ format: "json" }));
assert.equal(report.diff?.filesChanged, 1);
assert.equal(report.failedTools.length, 1);
assert.equal(report.usage.input, 300);
assert.equal(report.cost?.complete, true);
console.log(result.report());
console.log("Saved reports:", directory);
