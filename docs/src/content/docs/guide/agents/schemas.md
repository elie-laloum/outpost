---
title: "Use Zod, Valibot or Ajv schemas"
description: "Replace manual checks with reusable typed schemas for responses and JSON artifacts."
---

Both `response.json({ schema })` and `artifact.json({ schema })` accept a validator that returns the validated value or throws, synchronously or asynchronously. They also accept [Standard Schema](https://standardschema.dev/schema) objects directly, including Zod 4 and Valibot 1 schemas. Install your chosen library in your workflow project; Outpost does not require it in the sandbox or bundle it as a runtime dependency.

Use Zod for a chainable API, Valibot for a modular functional API, or Ajv when you already maintain JSON Schema. The examples below share one contract: an object containing an `endpoint` string. They deliberately reject unknown properties so all three variants have the same behavior. No performance ranking is assumed; measure your actual schemas if validation becomes a bottleneck.

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

Install all three libraries to run this comparison. In your own workflow, install only the one you use.

```sh
npm install zod@4 valibot@1 ajv@8
```

Save the following files alongside **example.mts**.

## Define a Zod schema

Save **zod-schema.mts**. Passing the schema object directly preserves output type inference without a wrapper or a manual type assertion.

```ts file=zod-schema.mts
import { z } from "zod";

export const apiSchema = z.strictObject({
  endpoint: z.string(),
});
```

[`z.strictObject`](https://zod.dev/api#zstrictobject) rejects unknown keys. Use `z.object` instead if you want to accept and strip them, as a manual validator returning only `{ endpoint }` would do.

## Define a Valibot schema

Save **valibot-schema.mts**. Valibot exposes the same Standard Schema validation interface, so the Outpost call stays identical.

```ts file=valibot-schema.mts
import * as v from "valibot";

export const apiSchema = v.strictObject({
  endpoint: v.string(),
});
```

[`v.strictObject`](https://valibot.dev/api/strictObject/) rejects unknown keys; `v.object` strips them instead.

## Adapt an Ajv validator

Save **api.types.ts**. Ajv's `JSONSchemaType` checks the JSON Schema against this declared TypeScript type.

```ts file=api.types.ts
export interface Api {
  endpoint: string;
}
```

Save **ajv-schema.mts**. Compile once and reuse the validator. A synchronous Ajv validator returns a boolean; Outpost's function contract requires the validated value on success and an exception on failure. Passing `validate` directly would make the response value a boolean, even for rejected data.

```ts file=ajv-schema.mts
import { Ajv } from "ajv";
import type { JSONSchemaType } from "ajv";
import type { Api } from "./api.types.ts";

const ajv = new Ajv();
const definition: JSONSchemaType<Api> = {
  type: "object",
  properties: { endpoint: { type: "string" } },
  required: ["endpoint"],
  additionalProperties: false,
};
const validate = ajv.compile(definition);

export function apiSchema(input: unknown): Api {
  if (!validate(input)) throw new Error(ajv.errorsText(validate.errors));
  return input;
}
```

This adapter is for synchronous Ajv schemas, using its default non-coercing behavior. Ajv's `$async` schemas require awaiting validation and handling its rejection separately. See [Ajv's TypeScript guide](https://ajv.js.org/guide/typescript.html) and [validator reuse](https://ajv.js.org/guide/getting-started).

## Reuse a schema for responses and artifacts

Save **example.mts**. The same `schema` option works with either a Standard Schema object or the Ajv adapter. The loop exercises all three alternatives; an application can import just one schema and use the two factory calls directly.

```ts file=example.mts
import assert from "node:assert/strict";
import { artifact, response, ResponseError } from "@elie-laloum/outpost";
import { apiSchema as zodSchema } from "./zod-schema.mts";
import { apiSchema as valibotSchema } from "./valibot-schema.mts";
import { apiSchema as ajvSchema } from "./ajv-schema.mts";

for (const [name, schema] of [
  ["Zod", zodSchema],
  ["Valibot", valibotSchema],
  ["Ajv", ajvSchema],
] as const) {
  const report = response.json({ tag: "api", schema });
  const contract = artifact.json({ name: "api", version: "1", schema });

  const value = await report.read('<api>{"endpoint":"/users"}</api>');
  const endpoint: string = value.endpoint;
  const bytes = await contract.encode(value);
  assert.deepEqual(await contract.decode(bytes), { endpoint });

  for (const invalid of [{}, { endpoint: 42 }, { endpoint, extra: true }]) {
    const json = JSON.stringify(invalid);
    await assert.rejects(report.read(`<api>${json}</api>`), ResponseError);
    await assert.rejects(contract.decode(new TextEncoder().encode(json)));
  }

  console.log(`${name}: ${endpoint}; invalid payloads rejected`);
}
```

```sh
node example.mts
```

## Understand the result

The program prints one success line per library with `/users` and confirms that missing fields, wrong types and unknown properties are rejected. TypeScript infers `{ endpoint: string }` for the response value. Artifact encoding and decoding use the same validator. This example keeps bytes in memory, allocates no sandbox and creates no artifact store; only the demonstration files and installed packages remain on disk.

Pass the response specification as `response` to `dispatch` to receive the validated output as `result.value`. The agent prompt must still request the matching tag and payload, for example `Return <api>{"endpoint":"/users"}</api>`. Outpost does not derive an agent-facing JSON Schema from these validators. Validation checks the data shape, not whether the endpoint exists.

Response validation failures are wrapped in `ResponseError`; artifact validation failures reject encoding or decoding. Configuring `repairs` affects agent dispatch with a resumable adapter, not a direct `report.read()` call. See [response guide](../responses/) and [artifact ownership and storage](../../advanced/artifacts/).

## Transformations and asynchronous validation

Outpost awaits both validation functions and Standard Schema validators, and uses their returned output. With transformations, that output can differ from the input; its type determines the response value type.

For artifacts, validation runs during both encoding and decoding. Reuse schemas that accept their own serialized output and remain stable on repeated validation. A transformation from a string to a `Date`, for example, is unsuitable for this JSON artifact contract: encoding requires lossless JSON values. Keep JSON-compatible values such as ISO strings in persisted contracts.

The existing manual `schema(input) { ... }` form remains useful for custom logic. It must return the validated value and throw or reject on failure; returning `false` is a successful boolean result, not a validation error.
