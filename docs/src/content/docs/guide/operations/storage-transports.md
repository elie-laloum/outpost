---
title: Store workflow data locally or on S3
description: Configure object transports for artifacts, checkpoints, journals, conversations and operational state.
sidebar:
  order: 7
---

Use a `Transport` to choose where Outpost reads and writes persistent data. Stores retain their domain rules while local and S3 adapters provide versioned binary objects and conditional mutations. Available since Outpost 4.2.0; existing directory configurations retain their behavior.

<!-- scenario:offline -->
<!-- preparation:offline -->

<details>
<summary>Prepare this example from scratch</summary>

Use Node.js **24+** and npm. Start in a new directory for each example.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Save the example as **example.mts** in this directory. No account, API key or container is needed.

</details>

<!-- /preparation -->

## Try it

Save **example.mts** in the prepared directory.

```ts file=example.mts
import assert from "node:assert/strict";
import {
  localTransport,
  artifactStore,
  artifact,
  publishArtifact,
  readStoredArtifact,
  workflowCheckpointStore,
  task,
  workflow,
  inspectRecovery,
} from "@elie-laloum/outpost";

const transporter = localTransport({ directory: "./state" });
const store = artifactStore({ transporter });
const contract = artifact.binary({ name: "report", version: "1" });
const reference = await publishArtifact(
  store,
  contract,
  Uint8Array.of(0, 255),
  {
    producer: { executionId: "demo", taskKey: "publish", attempt: 1 },
  },
);
let calls = 0;
const read = task({
  key: "read",
  async perform() {
    calls++;
    return [...(await readStoredArtifact(store, contract, reference))];
  },
});
const graph = workflow("transport-demo", [read]);
const checkpoint = {
  store: workflowCheckpointStore({ transporter }),
  runId: "demo-1",
  version: "1",
};
(await graph.start({ checkpoint })).unwrap();
const before = calls;
const resumed = await graph.start({ checkpoint });
resumed.unwrap();
assert.deepEqual(resumed.value(read), [0, 255]);
assert.equal(calls, before);
const inventory = await inspectRecovery({ transporter });
console.log(
  resumed.value(read),
  "replayed:",
  calls - before,
  "bytes:",
  inventory.usage.bytes,
);
```

```sh
node example.mts
```

## Understand the result

The output includes `[0, 255]` and `replayed: 0`. The binary artifact and checkpoint remain under `state/`; another invocation reopens the saved workflow without rerunning its completed task. The inventory counts logical payload bytes, excluding transport envelopes and backend overhead.

## Select S3

Install the optional SDK with `npm install @aws-sdk/client-s3`. Save **transport-s3.mts**, then replace the local factory in **example.mts** with `import { transporter } from "./transport-s3.mts";`.

```ts file=transport-s3.mts
import { S3Client } from "@aws-sdk/client-s3";
import { s3Transport } from "@elie-laloum/outpost/transports/s3";

export const client = new S3Client({ region: "eu-west-3" });
export const transporter = s3Transport({
  client,
  bucket: "your-existing-private-bucket",
  prefix: "project-a",
});
```

Provide the existing bucket and configure the client’s credentials on the coordinator. Run `node example.mts` again with this transport. The client belongs to you: call `client.destroy()` only after all stores and operations have finished. Storage credentials are not forwarded to agents.

The bucket or compatible endpoint must support conditional PUT and DELETE, complete object reads and paginated listing. A compatible API name alone does not establish these guarantees. Keep a dedicated prefix: Outpost envelopes are not interchangeable with arbitrary files uploaded to the same bucket. See [AWS conditional requests](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html).

## Configure each responsibility

| Responsibility        | Configuration                                                                                                                                      | Lifetime and behavior                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Artifacts             | `artifactStore({ transporter })` or `fileArtifactStore({ transporter })`                                                                           | Immutable publication and bounded reads; retained while references are needed.                                                             |
| Checkpoints           | `workflowCheckpointStore({ transporter })` or `fileWorkflowCheckpointStore({ transporter })`                                                       | Exclusive run ownership and conditional checkpoint writes.                                                                                 |
| Journals              | `logging: { transporter, verbose: true }`                                                                                                          | Each dispatch creates its own index and immutable event chain. Read `result.logReference` using `readJournal({ transporter, reference })`. |
| Conversations         | `storage: transportConversations("claude", { transporter, namespace: "project-a" })` on the agent adapter                                          | Claude/Codex capture, child transcripts, restore and fork. Use the same namespace across checkout paths and machines.                      |
| Recovery archives     | `recoveryTransport: transporter` on the sandbox                                                                                                    | Before applying downloaded changes, publish a verified archive. Local staging remains. Archives survive successful sandbox closure.        |
| Reservations          | `storageQuota: { transporter, maxBytes, reserveBytes }` on workspace options, or `reserveRecoveryStorage({ transporter, maxBytes, reserveBytes })` | Shared conditional admission ledger; explicit release.                                                                                     |
| Resource activity     | `activityTransport: transporter` on the sandbox                                                                                                    | Record operation transitions remotely; normal closure removes the record.                                                                  |
| Inspection and quotas | `inspectRecovery({ transporter, resources: true })`, `assertRecoveryQuota({ transporter, maxBytes })`                                              | Observe object payloads and resource records. Remote PID ownership remains unverified.                                                     |
| Retention             | `planRecoveryRetention({ transporter, policy })`, then `pruneRecoveryRetention(plan, { transporter })`                                             | Only explicitly selected closed journals are eligible. Both group membership and revisions are revalidated.                                |

An adapter can be composed as `{ ...agent({ harness: claudeHarness() }), storage: transportConversations("claude", { transporter, namespace: "project-a" }) }`. Native authentication remains independent of transcript storage.

## Ownership and interrupted writes

Checkpoint ownership does not expire automatically. After a crash, first stop the previous runner through your own process or infrastructure controls. Its object key is `checkpoints/<SHA-256 of runId>.json`; inspect that object to obtain its revision, then call `recoverWorkflowCheckpoint({ transporter, runId, revision })`. This preserves checkpoint values and rejects a concurrent change. Restarting incomplete tasks still requires `resume: "retry-incomplete"`; external effects may repeat.

Reservations likewise remain until released. Their `release()` stays usable after cancellation. An abandoned reservation must be reconciled explicitly in the versioned `reservations/ledger` after its owner has stopped; never infer this from a remote PID. Admission counts observed payload usage plus outstanding reservations, so it can conservatively count already-written reserved bytes twice. It coordinates cooperating callers, not arbitrary writers or a physical bucket quota.

A write interrupted before acknowledgement can have succeeded remotely. Reread its version before retrying. Do not replace conditional writes with unconditional overwrites. Event publication commits a segment before advancing its journal index; a crash leaves a readable committed prefix and may retain an unreferenced segment. Closing a journal awaits pending writes and reports failures. Event submission itself remains asynchronous.

## Restore and retain data

Call `archiveRecovery({ transporter, directory })` to archive a retained transfer explicitly. It verifies the snapshot, stores chunks with SHA-256 and publishes the manifest last. Call `materializeRecoveryArchive({ transporter, reference, destination })` to recreate it in a new local directory. Then use [recovery restoration](../recovery-restoration/) with the source Git repository. These archives preserve recovery payloads; they do not replace the source repository with an autonomous Git backup. Partial materializations and original recovery sources are retained on failure.

Automatic archives can be discovered by their `recovery/<id>/manifest` objects. Retained local transfers also contain `archive-reference.json` after publication. Interrupted uploads can leave unreferenced chunks; automatic retention protects recovery data.

Conversations return both a durable `reference` and a real local `file`. Captured/materialized copies remain below `.outpost/recovery/conversations` so returned transcript paths stay readable. `transcriptReference` is also exposed on turns and dispatch results. These local copies require independent retention after consumers finish reading them.

Transport retention protects artifacts, checkpoints, conversations, archives, reservations, resources and incomplete journals. The supported scope is `closed-logs`; local Git/workspace cleanup and process-lock inspection are rejected in transport mode. A partial deletion can leave protected orphan segments and is reported as retained. Listing and quota results are observations across multiple objects, not transactional snapshots.

## Existing directories and new adapters

Pass exactly one of `directory` or `transporter` to the compatibility file factories. An existing directory store keeps its format; selecting a transport creates a different layout and does not migrate old checkpoints or blobs automatically. `logging.file` and `logging.transporter` are mutually exclusive. Remote journals expose `logReference` rather than putting an S3 URI in `log`.

Implement [Transport](../../../reference/transport/) to add a backend: bounded complete reads, safe keys, fresh opaque revisions, atomic create/update conditions, conditional deletion and paginated metadata iteration. Keep store ownership rules outside the adapter. The local adapter’s process locks are designed for one host; using a mounted NFS path does not create distributed ownership guarantees.

Git worktrees, SQLite, sandbox homes, execution directories and mounts still use filesystems. Local tests cover object contracts and the real S3 SDK against a simulated HTTP service; successful authenticated AWS/S3-compatible and NFS campaigns remain separate validation work.
