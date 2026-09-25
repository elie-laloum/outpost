---
title: "Pass a durable artifact between tasks"
description: "Publish a validated contract, then read it through a declared dependency."
---

Publish a validated contract, then read it through a declared dependency.

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
import { resolve } from "node:path";
import {
  artifact,
  artifactTask,
  fileArtifactStore,
  fileWorkflowCheckpointStore,
  readArtifact,
  task,
  workflow,
} from "@elie-laloum/outpost";

const store = fileArtifactStore({
  directory: resolve(".outpost/artifacts"),
  maxBytes: 1024 * 1024,
});
const api = artifact.json({
  name: "service-api",
  version: "1",
  schema(input: unknown) {
    if (
      !input ||
      typeof input !== "object" ||
      !("endpoint" in input) ||
      typeof input.endpoint !== "string"
    )
      throw new Error("Expected an endpoint string");
    return { endpoint: input.endpoint };
  },
});
const publish = artifactTask({
  key: "publish-api",
  store,
  contract: api,
  produce: () => ({ endpoint: "/users" }),
});
const consume = task({
  key: "consume-api",
  after: [publish],
  async perform(context) {
    const value = await readArtifact(context, publish, api, store);
    return value.endpoint;
  },
});
const result = await workflow("api-contract", [publish, consume]).start({
  checkpoint: {
    store: fileWorkflowCheckpointStore({ directory: resolve(".outpost/runs") }),
    runId: "api-contract-1",
    version: "1",
  },
});
result.unwrap();
if (result.value(consume) !== "/users")
  throw new Error("Unexpected artifact value");
console.log(result.value(consume));
```

```sh
node example.mts
```

## Understand the result

The output is `/users`. The task output is a JSON reference while bytes live in the caller-owned artifact store. Reads check the contract and content integrity. Hashes and lineage do not authenticate producers. Retain objects as long as saved workflow results need them. Sandbox disposal does not delete this store.

[Contracts, options and edge cases](../../../reference/behavior/workflows/artifacts/).

Any persisted example files remain inside this demonstration directory.
