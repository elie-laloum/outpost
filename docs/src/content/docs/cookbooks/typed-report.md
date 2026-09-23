---
title: "Turn analysis into typed data"
description: "Turn analysis into typed data — Outpost"
sidebar:
  order: 2
---

Use this when a dashboard or another task needs structured data. Complete [Claude authentication](../../agents/connect-claude/) and the [shared setup](../).

```ts
import { dispatch, claude, response } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: claude(),
  branch: { mode: "named", name: "audit/test-readiness" },
  brief: {
    text: 'Inspect the test setup without editing files. Return <report>{"ready":true,"summary":"explanation"}</report>. Use false if prerequisites are missing.',
  },
  deadlineMs: 180_000,
  response: response.json({
    tag: "report",
    repairs: 1,
    schema(value) {
      if (
        !value ||
        typeof value !== "object" ||
        !("ready" in value) ||
        typeof value.ready !== "boolean" ||
        !("summary" in value) ||
        typeof value.summary !== "string"
      )
        throw new Error("Expected ready and summary");
      return { ready: value.ready, summary: value.summary };
    },
  }),
});
console.log(result.value.ready, result.value.summary);
```

## Validation boundary

The schema validates shape, not truth. Compare the report with actual files or commands. Asking an agent not to edit does not make the filesystem read-only.

## Invalid responses

One repair turn can resume with validation feedback. Exhausted repair throws a response error with recovery metadata. Keep structured responses at one pass. See [validated responses](../../agents/responses/).
