---
title: "Choose what runs, independently of where"
description: "Construct agent configurations without allocating a sandbox or calling a model."
---

Construct agent configurations without allocating a sandbox or calling a model.

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
import { claude, codex, gemini, agentVersions } from "@elie-laloum/outpost";

const agents = [codex(), claude(), gemini()];
assert.deepEqual(
  agents.map((agent) => agent.name),
  ["codex", "claude", "gemini"],
);
console.log(agents.map((agent) => agent.name));
console.log(agentVersions);
```

```sh
node example.mts
```

## Understand the result

Adapters choose native CLI behavior. Providers choose the environment. Constructing an adapter does not authenticate it or make a model request. Pass an adapter to dispatch; change the provider independently. Omitted model settings use the CLI default. Gemini supports fresh sessions only, while Claude and Codex can capture and resume native conversations.

[Contracts, options and edge cases](../../../reference/behavior/agents/adapters/).

Any persisted example files remain inside this demonstration directory.
