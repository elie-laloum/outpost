---
title: "Manage context and skills"
description: "Keep model history within bounds and load task-specific instructions when needed."
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

## Write the system instructions

API reference: [HarnessInstructionsOption](../../reference/harnessinstructionsoption/) and [HarnessSkillOptions](../../reference/harnessskilloptions/).

Load the project’s `AGENTS.md` from the borrowed sandbox to build the system instructions. The example uses its content when the file can be read, and returns an empty string otherwise.

```ts
import { defineHarnessInstructions } from "@elie-laloum/outpost";

export const projectGuidance = defineHarnessInstructions(
  async ({ sandbox, signal }) => {
    const result = await sandbox.invoke({
      executable: "cat",
      arguments: ["AGENTS.md"],
      signal,
    });
    return result.status === 0 ? result.stdout : "";
  },
);
```

Pass `instructions: ["Answer with evidence.", projectGuidance]`. The resolver receives the borrowed `sandbox`, the `signal`, the `model` and, when the harness declares [MCP servers](../mcp-servers/), an `mcp` accessor for their prompts.

## Load skills on demand

A skill is guidance and tools the model loads only when it needs them. Its instructions stay out of the system prompt until then.

```ts
import { reportValue } from "./reporter.ts";
import {
  createHarnessGitTools,
  defineHarnessSkill,
} from "@elie-laloum/outpost";

export const review = defineHarnessSkill({
  name: "review",
  description: "Inspect a patch and report concrete regressions.",
  instructions:
    "Read the diff. Check changed behavior against callers and tests. Cite file paths.",
  tools: [createHarnessGitTools()],
});
reportValue(
  review.name,
  review.tools.map((tool) => tool.name),
);
// Example output: review [ 'git' ]
```

<!-- check:run -->

The script prints `review [ 'git' ]`: the skill name and the tools it unlocks. Pass it with `createHarness({ skills: [review] })`.

<!-- canvas -->

- **Advertise**: The system instructions list each skill’s name and description.
  - Steps
  - → **Load**: then
- **Load**: The model calls `load_skill` with a skill name.
  - Steps
  - **Return the instructions**: Outpost resolves them and sends them back as the tool result.
  - **Unlock the tools**: The skill’s tools become callable for the rest of the conversation.
  - → **Use**: then
- **Use**: The model follows the instructions and calls the skill’s tools.
  - Steps
  - **Before loading**: A skill tool call returns an error asking the model to load the skill.

API reference: [HarnessInstructionsOption](../../reference/harnessinstructionsoption/) and [HarnessSkillOptions](../../reference/harnessskilloptions/).

:::caution
A skill guides the model; it enforces nothing. To block a tool, use [permissions](../harness-permissions/); to require a decision before continuing, use [approvals](../approvals/).
:::

## Limits

- `summarizeHistory()` measures serialized characters, not tokens. Leave a margin when you size `triggerCharacters` from the model’s window.
- An incomplete or empty summary fails the turn with code `response`.
- A compaction that removes the `load_skill` call locks that skill’s tools again until the model reloads it.
- Skill tool definitions are sent with every request, loaded or not; skills save instruction text, not tool schemas.
- `conversations: false` stops storing the transcript and disables continuation and response repairs ([Conversations](../conversations/)).

API: [summarizeHistory](../../reference/summarizehistory/) · [truncateToolResults](../../reference/truncatetoolresults/) · [defineHarnessContextStrategy](../../reference/defineharnesscontextstrategy/) · [defineHarnessInstructions](../../reference/defineharnessinstructions/) · [defineHarnessSkill](../../reference/defineharnessskill/) · [HarnessOptions](../../reference/customharnessoptions/).
