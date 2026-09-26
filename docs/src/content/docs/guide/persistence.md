---
title: "Persistence"
description: "Choose where durable runtime objects are stored."
---

Outpost persists artifacts, checkpoints, journals, reservations and resource activity through `Transport`. Stores define object semantics; transports provide bounded binary I/O and conditional mutations.

```ts
import {
  localTransport,
  artifactStore,
  workflowCheckpointStore,
} from "@elie-laloum/outpost";

const transporter = localTransport({ directory: ".outpost/storage" });
const artifacts = artifactStore({ transporter });
const checkpoints = workflowCheckpointStore({ transporter });
```

## Local storage

`localTransport({ directory })` creates a versioned layout in a private local directory. The default runtime storage lives under the repository’s `.outpost/storage`. Local locks coordinate processes on that machine; this is not distributed NFS ownership.

## Remote storage

Use [object storage](../object-storage/) to persist the same store contracts remotely. The application owns the client and its lifecycle. Closing a sandbox or workflow does not close an externally supplied transport client.

## Conditional writes

A transport write provides `ifRevision: null` to create, or the observed revision to replace. Deletion also requires the observed revision. `TransportConflict` means another writer changed the object; re-read before deciding what to do. Listing metadata is not a transaction over all listed objects.

Native Git workspaces, execution staging and transcript restoration still need filesystems. Selecting a remote transport does not move the entire runtime off disk.

API: [Transport](../../reference/transport/) · [localTransport](../../reference/localtransport/) · [TransportConflict](../../reference/transportconflict/).
