---
title: "Context management"
description: "Keep model-loop history within practical bounds."
---

Set `context` on the built-in harness to rewrite history before a model request. Choose a strategy based on what you can afford to lose.

```ts
import { summarizeHistory, truncateToolResults } from "@elie-laloum/outpost";

const compact = summarizeHistory({
  triggerCharacters: 200_000,
  keepRecentMessages: 6,
});
const truncate = truncateToolResults({ keepRecent: 4, maxCharacters: 8_000 });
```

`truncateToolResults()` shortens older tool output while retaining recent results. `summarizeHistory()` replaces older history with a model-generated summary and keeps recent messages. Summarization makes an additional model request and contributes to usage.

## Custom strategies

Use `defineHarnessContextStrategy({ name, compact })` to implement a different policy. The callback receives messages, step, model, signal and a summarization function. Return replacement messages or leave them unchanged. Preserve valid tool-call/result relationships and replayable reasoning required by the provider.

## Persistence

Context compaction changes what the model receives; it is separate from transcript storage. Configure `conversations` to choose or disable the conversation store. Disabling conversations also removes continuation-based repairs.

API: [summarizeHistory](../../reference/summarizehistory/) · [truncateToolResults](../../reference/truncatetoolresults/) · [defineHarnessContextStrategy](../../reference/defineharnesscontextstrategy/).
