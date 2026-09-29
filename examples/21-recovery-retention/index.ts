// Recovery and retention — decide which preserved data can go.
// Planning deletes nothing; deletion is a separate, explicit step.

import { join } from "node:path";
import {
  assertRecoveryQuota,
  createAgent,
  createHarness,
  createHarnessFileTools,
  dispatch,
  planRecoveryRetention,
  pruneRecoveryRetention,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);


// Each dispatch leaves a log in the repository's .outpost/logs.
await dispatch({
  repository,
  sandboxProvider,
  agent: createAgent({ model, harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }) }),
  brief: { file: join(import.meta.dirname, "brief.md") },
});


// 1. The plan: what is eligible for deletion, and why.
const plan = await planRecoveryRetention({
  repository,
  policy: { version: 1, scopes: ["closed-logs"], minAgeMs: 0 }, // in practice: more like 7 days
});

for (const entry of plan.entries) {
  console.log(entry.eligible ? "supprimable" : "conservé   ", entry.category, entry.path, "—", entry.reason);
}

console.log(`usage : ${plan.usageBytes} octets → ${plan.projectedBytes} après nettoyage`);


// 2. A safeguard: throws if storage exceeds 100 MB.
await assertRecoveryQuota({ repository, maxBytes: 100 * 1024 * 1024 });


// 3. Deletion, only when asked: `… index.ts --prune`.
if (process.argv.includes("--prune")) {
  const pruned = await pruneRecoveryRetention(plan);

  console.log("supprimés :", pruned.removed);
  console.log("conservés :", pruned.retained);
}
