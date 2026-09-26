---
title: "Output validation"
description: "Turn an agent answer into validated application data."
---

Pass a response specification to `dispatch({ response })`. The parsed value is returned as `result.value`; the complete answer remains in `result.text`.

## Define a JSON response

```ts
import { response } from "@elie-laloum/outpost";

const verdict = response.json({
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
console.log(await verdict.read('<verdict>{"approved":true}</verdict>'));
```

<!-- check:run -->

Ask for `<verdict>{"approved":true}</verdict>` in the brief. The validator reads the last complete matching tag, parses its JSON and applies your schema. Missing tags, invalid JSON and schema failures raise `ResponseError`.

## Use a schema library

`schema` accepts a parsing function or a Standard Schema validator, including compatible Zod and Valibot schemas. The schema validates the returned data; TypeScript types alone do not validate model output.

Use `response.text({ tag: "summary" })` when you only need trimmed text inside a tag.

## Repair a response

`repairs` defaults to zero. Increase it to allow additional repair turns on a resumable harness. Repairs consume time and usage; they are unavailable with fresh-session-only adapters. They do not replace checking a claim such as “tests passed” with a real command.

API: [response](../../reference/response/) · [ResponseError](../../reference/responseerror/).
