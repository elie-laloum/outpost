---
title: "Validate agent responses"
description: "Ask for structured output and validate it before using it in your application."
---

Use the [setup configuration](../setup/) and install `zod` with `npm install zod`. Save the first example as `verdict-task.ts` and run `node verdict-task.ts`. It reports the reasons when the agent rejects the last commit; a successful validation only proves the answer has the expected shape.

## Ask for a JSON answer

Define a JSON response contract to receive data your application can validate. The agent writes the answer inside the requested tag, and Outpost parses and validates it before exposing `result.value`.

```ts
import { dispatch, defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";
const verdict = defineJsonResponse({
  tag: "verdict",
  schema: z.object({ approved: z.boolean(), reasons: z.array(z.string()) }),
});
const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  response: verdict,
  brief: { text: "Review the last commit." },
});
if (!result.value.approved) console.log(result.value.reasons);
// Example output: [ 'Add a regression test.' ]
```

API reference: [DispatchResult](../../reference/dispatchresult/) and [defineJsonResponse](../../reference/definejsonresponse/).

## Handle an invalid answer

A missing tag, invalid JSON or a schema rejection makes `dispatch()` throw a `ResponseError` with code `response`, once no repair turn is left.

```ts
import {
  dispatch,
  defineTextResponse,
  ResponseError,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    response: defineTextResponse({ tag: "summary" }),
    brief: { text: "Summarize the README." },
  });
} catch (error) {
  if (!(error instanceof ResponseError)) throw error;
  console.error(error.message, error.raw, error.recovery);
}
```

API reference: [ResponseError](../../reference/responseerror/).

## Let the agent repair its answer

Set `repairs` to give the agent more turns after an invalid answer.

```ts
import { defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";

const verdict = defineJsonResponse({
  tag: "verdict",
  schema: z.object({ approved: z.boolean() }),
  repairs: 2,
});
```

Each repair resumes the same conversation with the validation error, the previous content and the response-format instructions and schema. It asks for the corrected tag only, without editing files or running commands. Repair turns add to `result.usage` and `result.text`.

Repairs need an agent that can continue its conversation; `dispatch()` refuses `repairs` otherwise. [Choose an agent](../choose-an-agent/) shows which harnesses can.

## Let Outpost request the format

Providing `response` appends final-answer instructions after the rendered brief and steering messages included at the start of a turn. They request exactly one final `<verdict>…</verdict>` block, with valid JSON and nothing after the closing tag. They override conflicting answer-format instructions, while preserving the task instructions. There is no switch to disable them.

Outpost obtains the input JSON Schema automatically through [Standard JSON Schema](https://standardschema.dev/json-schema), supported directly by Zod 4.2+. It sends that schema with the instructions. The input schema describes what the agent must return; validation can transform that JSON into a different `result.value`.

For a parsing function or a validator without a compatible converter, provide `jsonSchema` explicitly. An explicit schema takes precedence over automatic conversion. Definition fails with code `configuration` if the schema is missing, conversion fails or the schema contains values that cannot be preserved as JSON. Outpost snapshots the schema, excluding non-enumerable `~standard` protocol metadata, and does not resolve remote references.

The injected schema guides the agent; `schema` still performs validation. The two must describe the same input contract. Arrays, primitives and unions are supported, as well as objects.

## Validate with a parsing function

A function receives the parsed JSON as `unknown` and returns the typed value. Throw to reject it. `read()` applies the same rules as `dispatch()`, so you can test a response offline. Keep the validator in `validate-verdict.ts`, the response contract in `verdict.ts` and the offline check in `read-verdict.ts`; run `node read-verdict.ts` to read the final verdict.

<!-- tabs -->

```ts title="validate-verdict.ts"
export function validateVerdict(input: unknown) {
  if (
    typeof input !== "object" ||
    input === null ||
    !("approved" in input) ||
    typeof input.approved !== "boolean"
  )
    throw new Error("Expected approved: boolean");
  return { approved: input.approved };
}
```

```ts title="verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { validateVerdict } from "./validate-verdict.ts";
export const verdict = defineJsonResponse({
  tag: "verdict",
  jsonSchema: {
    type: "object",
    properties: { approved: { type: "boolean" } },
    required: ["approved"],
  },
  schema: validateVerdict,
});
```

```ts title="read-verdict.ts"
import { verdict } from "./verdict.ts";
const answer =
  'Draft: <verdict>{"approved":false}</verdict>\n' +
  'Final: <verdict>{"approved":true}</verdict>';
console.log(await verdict.read(answer));
// Example output: { approved: true }
```

<!-- check:run -->

The last complete `<verdict>…</verdict>` pair wins, so a draft earlier in the answer is ignored. Its content is trimmed and may be wrapped in a `json` code fence.

## Validate a transformed response offline

This contract accepts a JSON string and returns its length. Outpost injects the string input schema automatically, while `read()` returns a number. Save it as `length.ts` and run `node length.ts` after installing Outpost and Zod as in the example above.

```ts
import { defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";
const length = defineJsonResponse({
  tag: "length",
  schema: z.string().transform((value) => value.length),
});
console.log(
  length.jsonSchema?.type,
  await length.read('<length>"hello"</length>'),
);
// Example output: string 5
```

<!-- check:run -->

## Return plain text

`defineTextResponse()` automatically requests a final tagged text answer and returns its trimmed content, without JSON parsing.

```ts
import { defineTextResponse } from "@elie-laloum/outpost";

const summary = defineTextResponse({ tag: "summary" });
console.log(await summary.read("<summary>\n  Fixed the README.\n</summary>"));
// Example output: Fixed the README.
```

<!-- check:run -->

## Limits

- A dispatch with `response` runs one pass: `passes` must be 1 or omitted.
- A tag starts with a letter, followed by letters, digits, `_` or `-`.
- A valid response proves its shape, not its claims. Check “tests passed” by running the tests in a [sandbox session](../sandbox-sessions/) or a [verification loop](../verification-loops/).

API: [defineJsonResponse](../../reference/definejsonresponse/) · [defineTextResponse](../../reference/definetextresponse/) · [ResponseError](../../reference/responseerror/) · [ResponseSpec](../../reference/responsespec/) · [DispatchResult](../../reference/dispatchresult/).
