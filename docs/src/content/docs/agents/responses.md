---
title: "Validated responses"
description: "Validated responses — Outpost"
sidebar:
  order: 8
---

Use `response.text` or `response.json` to turn the agent’s answer into a typed value. The prompt must request the matching XML-style tag.

```ts
import { dispatch, codex, response } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: codex(),
  brief: {
    text: 'Return <report>{"ok": true}</report> after checking the project.',
  },
  response: response.json({
    tag: "report",
    repairs: 2,
    schema(input) {
      if (
        !input ||
        typeof input !== "object" ||
        !("ok" in input) ||
        typeof input.ok !== "boolean"
      )
        throw new Error("Expected an ok boolean");
      return { ok: input.ok };
    },
  }),
});
console.log(result.value.ok);
```

## Parsing rules

The last complete matching tag is used, with surrounding whitespace removed. JSON may be wrapped in a complete JSON code fence inside the tag. Tags must start with a letter and contain only letters, digits, underscores or hyphens. Missing tags, invalid JSON and schema failures produce `ResponseError`.

`schema` accepts a synchronous/asynchronous validation function or a Standard Schema validator (`~standard.validate`). The returned value determines `result.value`’s type. `response.text({ tag: "answer" })` returns a string. A spec can also be used independently through `await spec.read(text)`.

## Repair and recovery

`repairs` is a nonnegative integer, default `0`. A repair resumes the same conversation with validation feedback, so the adapter must support resumption. Claude Code and Codex support it; [Gemini](../gemini/) requires `repairs: 0`. Structured responses require `passes: 1`.

If repair is exhausted, inspect `ResponseError.tag`, `raw`, `cause` and recovery metadata. `recoveryDetails(error)` retrieves conversation, workspace and available commits/log/transcript without changing the original error identity. A failed response does not mean the agent made no filesystem changes.
