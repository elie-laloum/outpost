---
title: "Connect tasks with typed results"
description: "Transform text in two tasks and read the result through its task identity."
---

Transform text in two tasks and read the result through its task identity.

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

const source = task({ key: "source", perform: () => "  Hello   World  " });
const slug = task({
  key: "slug",
  after: [source],
  perform: (context) =>
    context.value(source).trim().toLowerCase().replace(/\s+/g, "-"),
});
const plan = workflow("text-pipeline", [source, slug]);
const result = await plan.start();
result.unwrap();
assert.equal(result.value(slug), "hello-world");
console.log(result.value(slug));
console.log(plan.diagram());
```

```sh
node example.mts
```

## Understand the result

The output is `hello-world`, followed by the Mermaid dependency graph. `after` both orders execution and authorizes reading that task’s value. A key labels a task; the actual task object identifies its typed result. Graphs reject duplicate keys, missing dependencies and cycles before running. Failed or skipped dependencies prevent downstream work.

[Contracts, options and edge cases](../../behavior/workflows/graph/).

Any persisted example files remain inside this demonstration directory.
