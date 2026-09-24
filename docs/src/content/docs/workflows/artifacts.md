---
title: Typed artifacts between repositories
description: Publish durable JSON or binary artifacts with validated contracts and lineage.
sidebar:
  order: 7
---

Artifacts carry data between tasks whose repositories and sandboxes have separate lifetimes. An `ArtifactReference` is a small, immutable JSON value containing the contract name/version, encoding, content SHA-256 and byte size, producer execution/task/attempt and ordered parent reference IDs. Its own ID binds these fields. References fit workflow checkpoints; payloads stay in an explicitly owned store.

## Publish and consume a contract

This complete host-side workflow needs Node.js 24+ and Outpost. It does not call a model. Both schema functions and Standard Schema validators are supported. Validation runs when publishing and reading; use a new contract version when changing its meaning.

```ts
import { resolve } from "node:path";
import {
  artifact,
  artifactTask,
  fileArtifactStore,
  fileWorkflowCheckpointStore,
  readArtifact,
  task,
  workflow,
} from "@elie-laloum/outpost";

const store = fileArtifactStore({
  directory: resolve(".outpost/artifacts"),
  maxBytes: 1024 * 1024,
});
const api = artifact.json({
  name: "service-api",
  version: "1",
  schema(input: unknown) {
    if (
      !input ||
      typeof input !== "object" ||
      !("endpoint" in input) ||
      typeof input.endpoint !== "string"
    )
      throw new Error("Expected an endpoint string");
    return { endpoint: input.endpoint };
  },
});
const publish = artifactTask({
  key: "publish-api",
  store,
  contract: api,
  produce: () => ({ endpoint: "/users" }),
});
const consume = task({
  key: "consume-api",
  after: [publish],
  async perform(context) {
    const value = await readArtifact(context, publish, api, store);
    return value.endpoint;
  },
});
const result = await workflow("api-contract", [publish, consume]).start({
  checkpoint: {
    store: fileWorkflowCheckpointStore({ directory: resolve(".outpost/runs") }),
    runId: "api-contract-1",
    version: "1",
  },
});
result.unwrap();
console.log(result.value(consume)); // /users
```

`readArtifact` requires a declared `after` dependency and checks that the reference names that dependency and the current execution. The contract supplies the return type and validates the actual data. Missing objects, incompatible versions, changed content, and schema failures reject the operation and fail the task.

For two repositories, let an `isolatedTask` produce a structured response. Add an `artifactTask` after it with `produce: context => context.value(backend).value`. A second `isolatedTask` declares `after: [publish]`; its `request` can be async and call `await readArtifact(context, publish, api, store)` to build the consumer brief. Set each isolated task's `repository` explicitly. This does not integrate or push either repository automatically. See [sandbox tasks](../sandbox-tasks/).

A full `isolatedTask` result contains continuation methods and cannot itself be checkpointed as JSON. Adding an artifact task afterward does not change that earlier result. For a checkpointed agent producer, call `dispatch` inside `artifactTask.produce`, pass `context.signal`, report `result.usage` through `context.reportUsage`, and return only `result.value`. The saved task output is then the artifact reference.

## Derived data and another process

An artifact task can declare `parents: context => [context.value(publish)]` alongside `after: [publish]`. The reference records those ordered IDs; changing lineage changes the artifact ID even when bytes stay identical. Declare every artifact input as a parent yourself: lineage is explicit, not inferred from reads. Duplicate parents are rejected. Parent IDs identify references, not filesystem paths; retain parent references separately if later readers need to traverse the lineage.

Serialize the reference with `JSON.stringify` or return it as a task result for [checkpoint persistence](../checkpoints/). Another process opens `fileArtifactStore` with the same directory, or a copied directory, then calls `readStoredArtifact(store, api, parsedReference, { producer, parents })`. This validates untrusted reference structure, contract, content, schema and the exact expected producer and ordered parents. The optional `producer` and `parents` expectations must come from your trusted orchestration state; without them, those fields are only checked for internal consistency. The reference has no host-specific path. A custom `ArtifactStore` can transport the bytes by ID to another machine; the read helper still verifies integrity.

For publishing outside a workflow, use `publishArtifact(store, api, value, { producer: { executionId, taskKey, attempt }, parents })`. `attempt` starts at 1. Inside a workflow, `artifactTask` supplies producer identity and cancellation automatically.

## Binary files, ownership and limits

Use `artifact.binary({ name: "bundle", version: "1" })` for `Uint8Array` payloads, including Node `Buffer` values. Read a file you own into bytes with `node:fs/promises.readFile`, then publish those bytes. Reads return a fresh byte array. No filenames, permissions, directories, archive extraction or symlinks are transported. Download sandbox files through its transfer capability before publication; sandbox disposal does not delete stored artifacts. JSON contracts require lossless JSON values; dates, undefined fields, nonfinite numbers and class instances are rejected.

`fileArtifactStore` defaults to a 16 MiB maximum per payload; `maxBytes` configures the limit on both reads and writes. Operations buffer one bounded payload in memory; callers should bound source files before loading them. This is not a total disk quota or a streaming large-file service.

The caller owns the directory and its retention. Keep it outside disposable worktrees, private to trusted writers and out of version control. Directory components and object files must not be symlinks; supply a canonical directory path on platforms with aliased temporary directories. Existing identical objects can be republished concurrently; conflicting content is rejected. Publication stages, flushes and atomically links an immutable object, then flushes the directory on supported platforms. Cancellation and ordinary write failures clean temporary files. A crash can leave hidden `.tmp` files or unreferenced complete objects; inspect and remove them only while writers are stopped. No automatic pruning runs: keep every object required by retained checkpoints and parent lineage before deleting anything.

A cancellation, failed checkpoint write or process loss can occur after an object is committed but before its reference is returned or saved. Publication and workflow checkpoints are separate transactions. There is no cross-repository transaction or rollback. Hashes detect inconsistency against a trusted reference; they do not authenticate a producer or prevent a writer from replacing both the reference and bytes. The filesystem store is for trusted local ownership, not hostile concurrent replacement of parent directories.
