---
title: "Bound workflow attempts and observed usage"
description: "Stop admission when a workflow needs more attempts than its budget permits."
---

Stop admission when a workflow needs more attempts than its budget permits.

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
import { task, workflow, WorkflowBudgetExceeded } from "@elie-laloum/outpost";

const read = task({ key: "read", perform: () => "hello" });
const convert = task({
  key: "convert",
  after: [read],
  perform: (ctx) => ctx.value(read).toUpperCase(),
});
const result = await workflow("bounded", [read, convert]).start({
  budget: { attempts: 1 },
});
assert.equal(result.status, "failed");
assert.ok(
  result.errors.some((error) => error instanceof WorkflowBudgetExceeded),
);
assert.equal(result.usage.attempts, 1);
console.log(result.status, result.usage.attempts);
```

```sh
node example.mts
```

## Understand the result

The output is `failed 1`: the first task finishes, but the second cannot start. Attempt budgets count task executions, including retries, not every internal model turn. Token limits use observed reports and may overshoot during concurrent work. They are not guaranteed billing caps.

[Contracts, options and edge cases](../../../reference/behavior/workflows/budgets/).

Any persisted example files remain inside this demonstration directory.
