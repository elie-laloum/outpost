---
title: "Validate agent responses"
description: "Ask for structured output and validate it before using it in your application."
---

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
  brief: {
    text: 'Review the last commit. End with <verdict>{"approved": true, "reasons": []}</verdict>.',
  },
});
if (!result.value.approved) console.log(result.value.reasons);
```

API reference: [DispatchResult](../../reference/dispatchresult/) and [defineJsonResponse](../../reference/definejsonresponse/).

## Write the brief for the tag

Outpost sends your brief unchanged: it adds no format instructions. Say which tag to use and show an example of its content, as above.

`dispatch()` checks that the brief contains the opening tag (`<verdict>`) before a sandbox starts. A missing tag fails with a `configuration` error.

## Validate with a parsing function

A function receives the parsed JSON as `unknown` and returns the typed value. Throw to reject it. `read()` applies the same rules as `dispatch()`, so you can test a response offline.

```ts
import { defineJsonResponse } from "@elie-laloum/outpost";

const verdict = defineJsonResponse({
  tag: "verdict",
  schema(input) {
    if (
      typeof input !== "object" ||
      input === null ||
      !("approved" in input) ||
      typeof input.approved !== "boolean"
    )
      throw new Error("Expected approved: boolean");
    return { approved: input.approved };
  },
});

const answer =
  'Draft: <verdict>{"approved":false}</verdict>\n' +
  'Final: <verdict>{"approved":true}</verdict>';
console.log(await verdict.read(answer)); // { approved: true }
```

<!-- check:run -->

The last complete `<verdict>…</verdict>` pair wins, so a draft earlier in the answer is ignored. Its content is trimmed and may be wrapped in a `json` code fence.

## Return plain text

`defineTextResponse()` returns the trimmed text inside the tag, without JSON parsing.

```ts
import { defineTextResponse } from "@elie-laloum/outpost";

const summary = defineTextResponse({ tag: "summary" });
console.log(await summary.read("<summary>\n  Fixed the README.\n</summary>")); // "Fixed the README."
```

<!-- check:run -->

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
    brief: { text: "Summarize the README inside <summary></summary>." },
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

Each repair resumes the same conversation with the validation error and the previous content. It asks for the corrected tag only, without editing files or running commands. Repair turns add to `result.usage` and `result.text`.

Repairs need an agent that can continue its conversation; `dispatch()` refuses `repairs` otherwise. [Choose an agent](../choose-an-agent/) shows which harnesses can.

## Limits

- A dispatch with `response` runs one pass: `passes` must be 1 or omitted.
- A tag starts with a letter, followed by letters, digits, `_` or `-`.
- A valid response proves its shape, not its claims. Check “tests passed” by running the tests in a [sandbox session](../sandbox-sessions/) or a [verification loop](../verification-loops/).

API: [defineJsonResponse](../../reference/definejsonresponse/) · [defineTextResponse](../../reference/definetextresponse/) · [ResponseError](../../reference/responseerror/) · [ResponseSpec](../../reference/responsespec/) · [DispatchResult](../../reference/dispatchresult/).
