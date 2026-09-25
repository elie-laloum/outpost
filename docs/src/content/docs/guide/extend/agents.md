---
title: "Implement an agent adapter"
description: "Run the complete example below, then inspect its output and compare it with the detailed contract."
---

Run the complete example below, then inspect its output and compare it with the detailed contract.

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
import type { AgentAdapter } from "@elie-laloum/outpost";

const adapter: AgentAdapter = {
  name: "example",
  resumable: false,
  capture: false,
  request(input) {
    if (input.continuation) throw new Error("Continuation is unsupported");
    return {
      executable: "example-agent",
      arguments: ["run", input.text ?? ""],
    };
  },
  events(line) {
    return [{ kind: "text", text: line }];
  },
};
console.log(adapter.name);
```

```sh
node example.mts
```

## Understand the result

The example owns its resources. Keep vendor protocol handling in an adapter and observer failures separate from task outcomes.

[Contracts, options and edge cases](../../behavior/extend/agents/).

Any persisted example files remain inside this demonstration directory.
