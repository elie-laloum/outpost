---
title: "Manage conversation history"
description: "Reduce the history sent to the model while retaining the stored transcript."
---

## Limit history size

Choose a context strategy to reduce the history sent to the model as a conversation grows. Outpost can summarize older messages or keep only a bounded part of the history; the stored transcript remains available.

<!-- tabs -->

```ts title="context-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="context-agent.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  summarizeHistory,
} from "@elie-laloum/outpost";
import { modelProvider } from "./context-model.ts";

export const coder = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: modelProvider,
    tools: [createHarnessFileTools()],
    context: summarizeHistory({
      triggerCharacters: 200_000,
      keepRecentMessages: 6,
    }),
  }),
});
```

Once the serialized history exceeds 200,000 characters, the model summarizes the older messages. The next request carries the first prompt, the summary and at least the six most recent messages.

## Choose a strategy

Choose `summarizeHistory()` when a long discussion needs to retain its decisions: older messages become a summary, at the cost of a model call. Choose `truncateToolResults()` when a few tool outputs dominate the history: it shortens them without generating a summary. Keep enough recent messages for the current task.

API reference: [summarizeHistory](../../reference/summarizehistory/), [truncateToolResults](../../reference/truncatetoolresults/) and [HarnessContextStrategyOptions](../../reference/harnesscontextstrategyoptions/).

A summary uses the agent’s model and provider. Its tokens count in the turn’s usage and in the harness `limits.usage` budget.

## Write a custom strategy

Compose strategies when a conversation needs both shorter tool results and a summary. This example applies the two in that order.

API reference: [HarnessContextStrategyOptions](../../reference/harnesscontextstrategyoptions/) and [HarnessContextInput](../../reference/harnesscontextinput/).

```ts
import {
  defineHarnessContextStrategy,
  summarizeHistory,
  truncateToolResults,
} from "@elie-laloum/outpost";

const truncate = truncateToolResults();
const summarize = summarizeHistory();

export const layered = defineHarnessContextStrategy({
  name: "truncate-then-summarize",
  async compact(input) {
    const truncated = await truncate.compact(input);
    const messages = truncated ?? input.messages;
    return (await summarize.compact({ ...input, messages })) ?? truncated;
  },
});
```

The returned list must start and end with a user message and keep each tool call with its result. Outpost validates it and removes replayed reasoning blocks before the next request.

## Compaction and the stored transcript

Compaction changes what the model receives, not what is stored. The transcript keeps every earlier message and records each compaction; [continuing the conversation](../conversations/) resumes from the compacted history. Observers receive a `compaction` event with the strategy name and the message count.

## Limits

- `summarizeHistory()` measures serialized characters, not tokens. Leave a margin when you size `triggerCharacters` from the model’s window.
- An incomplete or empty summary fails the turn with code `response`.
- `conversations: false` stops storing the transcript and disables continuation and response repairs ([Conversations](../conversations/)).

API: [summarizeHistory](../../reference/summarizehistory/) · [truncateToolResults](../../reference/truncatetoolresults/) · [defineHarnessContextStrategy](../../reference/defineharnesscontextstrategy/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/) · [defineHarnessSkill](../../reference/defineharnessskill/) · [HarnessOptions](../../reference/customharnessoptions/).

## Next steps

- [Load project instructions and skills](../harness-skills/)

<!-- Retained section anchors for existing bookmarks. -->

<span id="write-the-system-instructions"></span>
<span id="load-skills-on-demand"></span>
