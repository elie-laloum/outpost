// Resource activity — Outpost tracks the life of each sandbox (phase, operations…).
// Useful for knowing, after a crash, what was running and what failed.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createLocalTransport,
  createSandbox,
  inspectRecovery,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


// Traces are written to this transport (here, a local folder).
const transporter = createLocalTransport({ directory: join(import.meta.dirname, "state") });

const reader = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});


const sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  activityTransport: transporter,
});

await sandbox.command({ executable: "git", arguments: ["status", "--short"] });
await sandbox.dispatch({ agent: reader, brief: { file: join(import.meta.dirname, "brief.md") } });


// While the sandbox is alive: what has been recorded.
const during = await inspectRecovery({ transporter, resources: true });

for (const { record } of during.resources?.entries ?? []) {
  console.log("provider :", record?.sandboxProvider, "| phase :", record?.phase);
  console.log("opérations :", record?.operations);
  console.log("dernière :", record?.lastOperation);
}


// A normal close clears the trace: there's nothing left to recover.
await sandbox.close();

const after = await inspectRecovery({ transporter, resources: true });

console.log("traces après fermeture :", after.resources?.entries.length);
