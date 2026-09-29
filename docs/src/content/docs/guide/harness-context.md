---
title: "Context and skills"
description: "Keep the history within bounds and load instructions only when needed."
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

## Loadable skills

The built-in harness lists skill descriptions in its system instructions. The model calls `load_skill` to obtain the instructions and enable the skill’s tools.

```ts
import {
  defineHarnessSkill,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

const reviewSkill = defineHarnessSkill({
  name: "review",
  description: "Inspect a patch and report concrete regressions.",
  instructions:
    "Read the diff. Check changed behavior against callers and tests. Cite file paths.",
  tools: [createHarnessGitTools()],
});
```

Pass the result in `createHarness({ skills: [reviewSkill] })`. Names must be unique, and tool names must not collide with other harness or skill tools.

### Dynamic instructions

`instructions` can be text or a resolver receiving the sandbox, signal and model. Read repository material through the borrowed sandbox. Use `defineHarnessInstructions()` to compose reusable system instructions resolved for each turn.

A skill makes guidance available; it does not enforce a review gate. Use workflow [review gates](../approvals/) when continuation depends on an authorized decision.

API: [defineHarnessSkill](../../reference/defineharnessskill/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/).
