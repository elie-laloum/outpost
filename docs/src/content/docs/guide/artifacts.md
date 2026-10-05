---
title: "Share files and reports"
description: "Store task outputs as artifacts and pass references between tasks or processes."
---

## Publish and read an artifact

Use an artifact when a task produces a file or report that you want to store separately from its result. `publishArtifact()` encodes and stores the content, then returns a reference that `readStoredArtifact()` can use to read it back.

<!-- tabs -->

```ts title="coverage.ts"
import {
  defineJsonArtifact,
  createArtifactStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { z } from "zod";

export const coverage = defineJsonArtifact({
  name: "coverage-report",
  version: "1",
  schema: z.object({ lines: z.number(), files: z.array(z.string()) }),
});
export const store = createArtifactStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
```

```ts title="publish.ts"
import { publishArtifact, readStoredArtifact } from "@elie-laloum/outpost";
import { store, coverage } from "./coverage.ts";

export const reference = await publishArtifact(
  store,
  coverage,
  { lines: 87.5, files: ["src/parser.ts"] },
  { producer: { executionId: "nightly-42", taskKey: "coverage", attempt: 1 } },
);
console.log(await readStoredArtifact(store, coverage, reference));
```

<!-- check:run -->

The payload lands in `.outpost/storage/artifacts/<id>.blob`. The reference is a small JSON object: `id`, a SHA-256 `digest`, `size`, `contract`, `producer` and `parents`. Reading checks the contract, the size and the digest before decoding.

## When to use an artifact

|             | Task output                            | Artifact                                           |
| ----------- | -------------------------------------- | -------------------------------------------------- |
| Holds       | Lossless JSON in a checkpointed run    | JSON checked by a schema, or bytes                 |
| Size        | The whole checkpoint is capped, 16 MiB | Each artifact up to 16 MiB by default (`maxBytes`) |
| Readable by | Dependent tasks of the same run        | Any process with the store and the reference       |
| Checked     | Not validated when read                | Contract, size and digest on every read            |

Keep small results as task outputs. Publish an artifact for a large report, a binary file or a result another process reads: the checkpoint then keeps only the reference.

## Choose a contract

| Contract                                        | Value         | On publish and read                                                        |
| ----------------------------------------------- | ------------- | -------------------------------------------------------------------------- |
| `defineJsonArtifact({ name, version, schema })` | Lossless JSON | Validates with a Standard Schema (Zod, Valibot…) or a function that throws |
| `defineBinaryArtifact({ name, version })`       | `Uint8Array`  | Copies the bytes as they are                                               |

Change `version` when the format changes. A contract with another name, version or encoding rejects the reference with `Artifact contract mismatch`.

## Use artifacts in a workflow

`defineArtifactTask()` takes the usual task options plus `store`, `contract` and `produce(context)`. Its output is the reference; `readArtifact()` reads it from a task listed in `after`.

<!-- tabs -->

```ts title="findings.ts"
import {
  defineJsonArtifact,
  createArtifactStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { z } from "zod";

export const findings = defineJsonArtifact({
  name: "audit-findings",
  version: "1",
  schema: z.array(z.object({ file: z.string(), issue: z.string() })),
});
export const store = createArtifactStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
```

```ts title="audit.ts"
import { defineArtifactTask } from "@elie-laloum/outpost";
import { store, findings } from "./findings.ts";

export const audit = defineArtifactTask({
  key: "audit",
  store,
  contract: findings,
  produce: () => [{ file: "src/parser.ts", issue: "Unchecked input length" }],
});
```

```ts title="summary.ts"
import { defineTask, readArtifact } from "@elie-laloum/outpost";
import { audit } from "./audit.ts";
import { findings, store } from "./findings.ts";

export const summary = defineTask({
  key: "summary",
  after: [audit],
  perform: async (context) => {
    const items = await readArtifact(context, audit, findings, store);
    return `${items.length} finding(s) in ${items[0]?.file}`;
  },
});
```

```ts title="audit-report.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { audit } from "./audit.ts";
import { summary } from "./summary.ts";

export const result = await defineWorkflow("audit", [audit, summary]).start();
result.unwrap();
console.log(result.value(summary));
```

<!-- check:run -->

The task sets `producer` from the execution, its key and the attempt. `readArtifact()` rejects a reference produced by another execution or another task, then verifies and decodes the payload. In a real workflow, `produce` reads an agent task’s result with `context.value()`.

## Record lineage

`parents` lists, in order, the references an artifact was derived from. In `defineArtifactTask()`, pass `parents: (context) => [context.value(audit)]`.

```ts
import { readFile } from "node:fs/promises";
import { defineBinaryArtifact, publishArtifact } from "@elie-laloum/outpost";
import type { ArtifactReference, ArtifactStore } from "@elie-laloum/outpost";

declare const store: ArtifactStore;
declare const report: ArtifactReference;

const archive = defineBinaryArtifact({ name: "coverage-html", version: "1" });
const html = await publishArtifact(
  store,
  archive,
  await readFile("coverage.tar.gz"),
  {
    producer: { executionId: "nightly-42", taskKey: "html", attempt: 1 },
    parents: [report],
  },
);
```

The producer and the parents are part of the reference and of its `id`. Pass `producer` or `parents` to `readStoredArtifact()` to reject a reference that does not match them.

:::caution
A digest detects a changed or mismatched payload; it does not prove who published it. Anyone who can write to the store can publish any `producer`. Keep the store private and authenticate the processes allowed to write to it: see [Security](../security/).
:::

## Read an artifact in another process

A reference is plain JSON: save it in a checkpoint, a queue job or a file. Another process opens a store over the same transport and reads it with the same contract.

```ts
import { readFile } from "node:fs/promises";
import { readStoredArtifact } from "@elie-laloum/outpost";
import type { ArtifactContract, ArtifactStore } from "@elie-laloum/outpost";

declare const store: ArtifactStore;
declare const coverage: ArtifactContract<{ lines: number }>;

const saved: unknown = JSON.parse(await readFile("coverage.json", "utf8"));
const report = await readStoredArtifact(store, coverage, saved);
```

`readStoredArtifact()` validates the reference itself, so an edited `id`, `digest` or `producer` is rejected.

## Store artifacts remotely

`createArtifactStore({ transporter })` accepts any Transport. Use an [S3 or R2 transport](../object-storage/) to share artifacts between machines; [Where data lives](../storage/) covers the local layout.

## Limits

- An artifact’s contents are held in memory during publication and reading. To choose a size limit, see [ArtifactStoreOptions](../../reference/artifactstoreoptions/).
- A published artifact is immutable. Outpost never deletes one: expire old objects with your storage’s own rules.

API: [defineJsonArtifact](../../reference/definejsonartifact/) · [defineBinaryArtifact](../../reference/definebinaryartifact/) · [createArtifactStore](../../reference/createartifactstore/) · [publishArtifact](../../reference/publishartifact/) · [readStoredArtifact](../../reference/readstoredartifact/) · [defineArtifactTask](../../reference/defineartifacttask/) · [readArtifact](../../reference/readartifact/) · [ArtifactReference](../../reference/artifactreference/)
