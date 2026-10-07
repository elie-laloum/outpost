---
title: "Choose where data is stored"
description: "Configure transports for durable data and locate the files that stay in the repository."
---

## What Outpost saves

A transport stores versioned bytes under keys. The stores built on it interpret those bytes as checkpoints, artifacts or other durable data. Choose the transport to decide where the data lives, and the store to decide what it represents.

| Object                                      | Written through                                        | Without a transport you pass |
| ------------------------------------------- | ------------------------------------------------------ | ---------------------------- |
| [Checkpoints](../durable-runs/)             | `createWorkflowCheckpointStore({ transporter })`       | Required                     |
| [Artifacts](../artifacts/)                  | `createArtifactStore({ transporter })`                 | Required                     |
| [Task cache](../task-cache/)                | `createTaskCacheStore({ transporter })`                | Required                     |
| [Execution state](../run-state/)            | `createRunObserver({ transporter, id, kind })`         | Required                     |
| [Durable speculation](../speculation/)      | `durability.transporter` on `speculate()`              | Required                     |
| [Journals](../journals/)                    | `logging.transporter` on a dispatch or sandbox         | `.outpost/storage`           |
| Resource activity                           | `activityTransport` on a dispatch or sandbox           | `.outpost/storage`           |
| Storage reservations                        | `transporter` on `reserveRecoveryStorage()`            | `.outpost/storage`           |
| [Archived conversations](../conversations/) | `createTransportConversations(store, { transporter })` | Not archived                 |
| [Recovery archives](../recovery/)           | `recoveryTransport` on a dispatch or sandbox           | Not archived                 |

## Keep everything on disk

`createLocalTransport({ directory })` stores objects in a private local directory. Pass the repository’s `.outpost/storage` to keep your stores next to the journals and activity Outpost writes there by default.

```ts
import {
  createArtifactStore,
  createLocalTransport,
  createTaskCacheStore,
  createWorkflowCheckpointStore,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const checkpoints = createWorkflowCheckpointStore({ transporter });
const artifacts = createArtifactStore({ transporter });
const cache = createTaskCacheStore({ transporter });
```

Creating a transport or store does not write any data. When a store saves an object, the local transport writes a file atomically and restricts access to its owner.

<!-- files -->

- `.outpost/storage/`
  - `objects/`: One `.object` file per key, grouped by prefix.
    - `checkpoints/`: Workflow runs, one per `runId`.
    - `artifacts/`: Artifact bytes, addressed by digest.
    - `task-cache/`: Cached task results.
    - `logs/`: Journals.
    - `runs/`: Execution snapshots and observation events.
    - `resources/`: Activity of open sandboxes.
    - `reservations/`: The storage reservation ledger.
    - `speculations/`: Durable speculation state.
    - `conversations/`: Archived conversations.
    - `recovery/`: Archived recovery transfers.
  - `.outpost/locks/`: Locks that serialize writers on this machine.

The rest of the `.outpost` directory is described in [How it works](../how-it-works/).

## Share one transport

Pass the same transport to the stores and to the dispatch options, and every object of a run lands in one place.

```ts
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  dispatch,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const transporter = createLocalTransport({ directory: "/srv/outpost" });
const checkpoints = createWorkflowCheckpointStore({ transporter });

await dispatch({
  agent: coder,
  sandboxProvider,
  repository,
  brief: { text: "Update the changelog for the last release." },
  logging: { transporter },
  activityTransport: transporter,
  recoveryTransport: transporter,
});
```

Use a separate directory or prefix per project, so retention and access rules apply to one set of objects.

## Move storage off the machine

A remote transport keeps the same store contracts. [S3 and R2](../object-storage/) covers the setup; only the `transporter` line changes.

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { createWorkflowCheckpointStore } from "@elie-laloum/outpost";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";

const client = new S3Client({ region: "eu-west-1" });
const transporter = createS3Transport({
  client,
  bucket: "my-private-outpost",
  prefix: "outpost/",
});
const checkpoints = createWorkflowCheckpointStore({ transporter });

// ... run your workflows, then:
client.destroy();
```

Your application owns the client. Closing a sandbox or finishing a workflow never closes it: destroy it once every operation using it has finished.

## What stays on the local disk

A remote transport moves stored objects, not the runtime. These still need the host’s filesystem.

<!-- features -->

- [Worktrees and locks](../repository-and-branch/): Branches are checked out under `.outpost/workspaces` and locked under `.outpost/locks`.
  - Git
- [Native conversations](../conversations/): The agent reads its own store; an archived copy is restored to disk before it resumes.
  - Claude Code
  - Codex
- [Recovery transfers](../recovery/): Backups of a failed synchronization are written locally before any archive.

## Handle a write conflict

Every write names the revision it expects: `ifRevision: null` creates, the observed `revision` replaces or removes. If another writer changed the object first, the call throws `TransportConflict` and nothing is written.

```ts
import { reportValue } from "./reporter.ts";
import { createLocalTransport, TransportConflict } from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: ".outpost/storage" });
const bytes = (text: string) => new TextEncoder().encode(text);

const first = await transporter.write("notes/today", bytes("v1"), {
  ifRevision: null,
});
await transporter.write("notes/today", bytes("v2"), {
  ifRevision: first.revision,
});
try {
  await transporter.write("notes/today", bytes("v3"), {
    ifRevision: first.revision,
  });
} catch (error) {
  if (error instanceof TransportConflict) reportValue("stale:", error.key);
  // Example output: stale: notes/today
}
```

<!-- check:run -->

It prints `stale: notes/today`. Stores use the same fence: a workflow that lost ownership of its checkpoint fails on its next write instead of overwriting a newer run. Re-read the object before you decide what to do.

## Limits

- The local transport coordinates processes on one machine; it does not provide distributed ownership over NFS or other shared mounts.
- Listing returns current objects one by one, not a consistent snapshot of the prefix.
- Revisions fence stale writers; they do not authenticate who wrote an object.
- Keys are `/`-separated segments of letters, digits, `.`, `_` and `-`, not starting with a dot, up to 512 characters.

API: [Transport](../../reference/transport/) · [createLocalTransport](../../reference/createlocaltransport/) · [TransportConflict](../../reference/transportconflict/) · [createWorkflowCheckpointStore](../../reference/createworkflowcheckpointstore/) · [createArtifactStore](../../reference/createartifactstore/) · [createTaskCacheStore](../../reference/createtaskcachestore/) · [createTransportConversations](../../reference/createtransportconversations/) · [SandboxOptions](../../reference/sandboxoptions/) · [createS3Transport](../../reference/creates3transport/).
