// Storage reservations — announce the space you'll use BEFORE writing,
// so that parallel operations take one another into account.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  openWorkspace,
  reserveRecoveryStorage,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);

const MB = 1024 * 1024;


// 1. A manual reservation: released automatically at the end of the block.
{
  await using reservation = await reserveRecoveryStorage({ repository, maxBytes: 500 * MB, reserveBytes: 10 * MB });

  console.log("réservation :", reservation);
}


// 2. Simpler: the workspace reserves space itself, for its whole lifetime.
//    If the limit is already reached, opening fails before any work is done.
await using workspace = await openWorkspace({
  repository,
  storageQuota: { maxBytes: 500 * MB, reserveBytes: 10 * MB },
});

const reader = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});

const result = await workspace.dispatch({
  sandboxProvider,
  agent: reader,
  brief: { file: join(import.meta.dirname, "brief.md") },
});

console.log(result.text);
