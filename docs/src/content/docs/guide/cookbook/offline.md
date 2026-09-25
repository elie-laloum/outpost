---
title: "Run a parallel workflow without an agent"
description: "Collect three independent checks, then assemble a report after all three complete."
---

Collect three independent checks, then assemble a report after all three complete.

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
import { task, workflow } from "@elie-laloum/outpost";

const sources = ["configuration", "execution", "recovery"].map((name) =>
  task({
    key: name,
    perform: async ({ signal }) => {
      signal.throwIfAborted();
      return { name, checked: true };
    },
  }),
);

const report = task({
  key: "report",
  after: sources,
  perform: (context) => sources.map((source) => context.value(source)),
});

const plan = workflow("offline-example", [...sources, report]);
const result = await plan.start({ concurrency: 3 });
result.unwrap();
console.log(JSON.stringify(result.value(report), null, 2));
console.log(plan.diagram());
```

```sh
node example.mts
```

## Understand the result

The JSON report contains configuration, execution and recovery checks. `concurrency: 3` admits three independent tasks; the report waits for all dependencies. This is real workflow execution without model calls or containers.

Any persisted example files remain inside this demonstration directory.
