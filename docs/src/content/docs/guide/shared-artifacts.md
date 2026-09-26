---
title: "Shared artifacts"
description: "Publish typed values with integrity and lineage."
---

Artifacts store payloads independently of a task’s in-memory result. Pass small references between tasks or processes and read the payload through its versioned contract.

```ts
import {
  artifact,
  artifactStore,
  localTransport,
  publishArtifact,
  readStoredArtifact,
} from "@elie-laloum/outpost";

const report = artifact.json({
  name: "review-count",
  version: "1",
  schema(value) {
    if (typeof value !== "number" || !Number.isFinite(value))
      throw new Error("Expected a finite count");
    return value;
  },
});
const store = artifactStore({
  transporter: localTransport({ directory: ".outpost/storage" }),
});
const reference = await publishArtifact(store, report, 3, {
  producer: { executionId: "review-42", taskKey: "report", attempt: 1 },
});
console.log(await readStoredArtifact(store, report, reference));
```

<!-- check:run -->

## Choose a contract

`artifact.json()` validates lossless JSON when encoding and decoding. `artifact.binary()` stores copied byte arrays. A name and version identify the format; changing the data contract should change its version.

`publishArtifact()` records a digest, byte size, producer and optional ordered parent references. Publication is immutable. `readStoredArtifact()` verifies integrity and decodes with the expected contract.

## Use artifacts in a workflow

`artifactTask()` publishes a task’s output and `readArtifact()` consumes a declared artifact dependency. A checkpoint can store the resulting reference instead of a large report.

Digests and lineage detect mismatches; they do not authenticate the producer. Use a private store and authenticate the process allowed to publish.

API: [artifact](../../reference/artifact/) · [publishArtifact](../../reference/publishartifact/) · [readStoredArtifact](../../reference/readstoredartifact/) · [artifactTask](../../reference/artifacttask/).
