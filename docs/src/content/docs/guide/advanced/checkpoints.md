---
title: "Keep results across restarts"
description: "Reopen a completed workflow without executing its tasks again."
---

Reopen a completed workflow without executing its tasks again.

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

Save **example.mts** in `outpost-example/`.

```ts file=example.mts
import assert from "node:assert/strict";
import {
  fileWorkflowCheckpointStore,
  task,
  workflow,
} from "@elie-laloum/outpost";

let calls = 0;
const convert = task({
  key: "convert",
  perform: () => {
    calls++;
    return { slug: "hello-world" };
  },
});
const plan = workflow("durable-text", [convert]);
const checkpoint = {
  store: fileWorkflowCheckpointStore({ directory: "./state/checkpoints" }),
  runId: "text-1",
  version: "1",
};
const first = await plan.start({ checkpoint });
first.unwrap();
const before = calls;
const resumed = await plan.start({ checkpoint });
resumed.unwrap();
assert.equal(calls, before);
assert.equal(resumed.executionId, first.executionId);
assert.equal(resumed.value(convert).slug, "hello-world");
console.log(resumed.value(convert), "replayed:", calls - before);
```

```sh
node example.mts
```

## Understand the result

The output contains `hello-world` and `replayed: 0`. Run the same file again to reopen its saved result in another process. Keep graph identity and `version` stable; use a new run ID for an independent execution. Outputs must be lossless JSON. Interrupted work requires explicit replay authorization and may already have performed external effects.

[Contracts, options and edge cases](../../behavior/workflows/checkpoints/).

Any persisted example files remain inside this demonstration directory.
