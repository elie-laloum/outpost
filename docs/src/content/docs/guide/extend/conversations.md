---
title: "Decorate native conversation storage"
description: "Implement the storage contract independently of agent commands and sandbox allocation."
---

Implement the storage contract independently of agent commands and sandbox allocation.

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
import { conversations } from "@elie-laloum/outpost";
import type { ConversationStore } from "@elie-laloum/outpost";

const native = conversations.native("codex");
const observed: ConversationStore = {
  name: "observed-codex",
  locate: (id, repository, home) => native.locate(id, repository, home),
  async capture(id, context) {
    const record = await native.capture(id, context);
    context.warn?.(`Captured conversation ${record.id}`);
    return record;
  },
  restore: (record, context) => native.restore(record, context),
};
console.log(observed.name);
```

```sh
node example.mts
```

## Understand the result

The script constructs the store and prints its name without reading credentials or transcripts. Assign it to a custom AgentAdapter.storage when integrating. Actual capture and restore require the native conversation context and lease. Rewrite only structural working-directory metadata, preserve conversation identity on resume, and fail clearly if the authoritative transcript is missing.

[Contracts, options and edge cases](../../../reference/behavior/extend/conversations/).

Any persisted example files remain inside this demonstration directory.
