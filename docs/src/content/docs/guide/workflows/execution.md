---
title: "Handle failure and retry deliberately"
description: "Observe a failed task and verify that a dependent task does not execute."
---

Observe a failed task and verify that a dependent task does not execute.

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
import { task, workflow } from "@elie-laloum/outpost";

const validate = task({
  key: "validate",
  perform: () => {
    throw new Error("Whitespace regression");
  },
});
let delivered = false;
const deliver = task({
  key: "deliver",
  after: [validate],
  perform: () => {
    delivered = true;
  },
});
const result = await workflow("failed-validation", [validate, deliver]).start();
assert.equal(result.status, "failed");
assert.equal(delivered, false);
assert.throws(() => result.unwrap());
console.log(result.tasks.map(({ key, status }) => ({ key, status })));
```

```sh
node example.mts
```

## Understand the result

Validation fails and delivery is skipped. A workflow result retains task records and original errors; `unwrap()` converts a non-success into a `WorkflowFailure`. Retries repeat the task’s effects, so configure them only for operations whose replay you understand. Use dependency edges for shared resources and independent sandboxes for parallel agent work.

[Contracts, options and edge cases](../../../reference/behavior/workflows/execution/).

Any persisted example files remain inside this demonstration directory.
