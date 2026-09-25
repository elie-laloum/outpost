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
import {
  agent as composeAgent,
  claude,
  codex,
  gemini,
  agentVersions,
} from "@elie-laloum/outpost";

const agents = [
  composeAgent({ harness: codex.harness({}) }),
  composeAgent({ harness: claude.harness({}) }),
  composeAgent({ harness: gemini.harness({}) }),
];
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

Harness presets choose native CLI behavior. Compose an agent with its model and pass that agent to dispatch; select the environment independently with sandboxProvider. Construction performs no authentication or model request. Omitted model settings use the CLI default. Gemini supports fresh sessions only, while Claude and Codex can capture and resume native conversations.

[Contracts, options and edge cases](../../behavior/agents/adapters/).

Any persisted example files remain inside this demonstration directory.
