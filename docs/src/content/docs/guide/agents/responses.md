---
title: "Turn an answer into typed data"
description: "Validate an answer before using it in another task. This first example isolates parsing from model calls."
---

Validate an answer before using it in another task. This first example isolates parsing from model calls.

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
import { response, ResponseError } from "@elie-laloum/outpost";

const report = response.json({
  tag: "report",
  schema(value) {
    if (
      !value ||
      typeof value !== "object" ||
      !("passed" in value) ||
      typeof value.passed !== "boolean"
    )
      throw new Error("Expected a passed boolean");
    return { passed: value.passed };
  },
});
const value = await report.read('<report>{"passed":true}</report>');
assert.equal(value.passed, true);
await assert.rejects(
  report.read('<report>{"passed":"yes"}</report>'),
  ResponseError,
);
console.log(value);
```

```sh
node example.mts
```

## Understand the result

The result is `{ passed: true }`; the second response is rejected because a string is not a boolean. Pass this same specification as `response` to `dispatch` to obtain `result.value`. The schema validates data, not the truth of an agent’s claim. Use an actual test command to verify code. The typed-report recipe connects this example to a real agent.

[Contracts, options and edge cases](../../../reference/behavior/agents/responses/).

Any persisted example files remain inside this demonstration directory.
