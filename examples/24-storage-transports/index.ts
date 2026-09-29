// Storage transports — a single place (local folder or S3) for everything Outpost keeps:
// logs, conversations, artifacts, checkpoints…
//
// For S3, just swap the transport:
//   import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
//   const transporter = createS3Transport({ client: new S3Client({}), bucket: "my-bucket", prefix: "demo" });
// On a service without conditional DELETE (Cloudflare R2…), add `deleteMode: "tombstone"`:
// deletions become hidden markers, so a stale writer can't erase a newer object.

import { join } from "node:path";
import * as v from "valibot";
import {
  createAgent,
  createArtifactStore,
  createHarness,
  createHarnessConversations,
  createHarnessFileTools,
  createLocalTransport,
  createTransportConversations,
  createWorkflowCheckpointStore,
  defineArtifactTask,
  defineJsonArtifact,
  defineWorkflow,
  dispatch,
  inspectRecovery,
  readJournal,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const transporter = createLocalTransport({ directory: join(import.meta.dirname, "state") });


// 1. The harness's conversations and the dispatch log go to the transport.
const reader = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [createHarnessFileTools()],
    conversations: createTransportConversations(createHarnessConversations(), { transporter, namespace: "demo" }),
  }),
});

const result = await dispatch({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  agent: reader,
  brief: { file: join(import.meta.dirname, "brief.md") },
  logging: { transporter },
});

const events = await readJournal({ transporter, reference: result.logReference! });

console.log(`journal : ${events.length} événements`);
console.log("transcription :", result.transcriptReference?.key);


// 2. Artifacts and checkpoints use the same transport.
const summary = defineJsonArtifact({ name: "summary", version: "1", schema: v.string() });

const publish = defineArtifactTask({
  key: "publish",
  store: createArtifactStore({ transporter }),
  contract: summary,
  produce: () => result.text,
});

const run = await defineWorkflow("transport-demo", [publish]).start({
  checkpoint: { store: createWorkflowCheckpointStore({ transporter }), runId: "demo-1", version: "1" },
});
run.unwrap();


// 3. The inventory of everything stored.
const inventory = await inspectRecovery({ transporter });

for (const category of inventory.categories) console.log(`  ${category.name} : ${category.entries.length} objet(s)`);

console.log("total :", inventory.usage.bytes, "octets");
