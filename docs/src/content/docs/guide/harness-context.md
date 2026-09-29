---
title: "Context and skills"
description: "Keep a long built-in harness turn within the model’s context window, write its system instructions and load specialized guidance only when the model asks for it."
---

## Keep the history within bounds

A long turn accumulates tool output until a request no longer fits the model’s context window. Set `context` on `createHarness()`: before each model request, the strategy may rewrite the history the model receives.

```ts
import {
  createAgent,
  createAnthropicModelProvider,
  createHarness,
  createHarnessFileTools,
  summarizeHistory,
} from "@elie-laloum/outpost";

const coder = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
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

| Strategy                         | What the model keeps                                                                                                 | Options and defaults                                    | Cost                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------ |
| `truncateToolResults()`          | Every message. Older tool results are cut to `maxCharacters` and marked as truncated; the recent ones stay complete. | `keepRecent`: 4 result messages, `maxCharacters`: 2,000 | None. The cut output is lost to the model. |
| `summarizeHistory()`             | The first prompt, a summary of the older messages and the recent messages.                                           | `triggerCharacters`: 400,000, `keepRecentMessages`: 6   | One extra model request per summary.       |
| `defineHarnessContextStrategy()` | What your `compact` function returns.                                                                                | `name`, `compact`                                       | Whatever your function spends.             |

A summary uses the agent’s model and provider. Its tokens count in the turn’s usage and in the harness `limits.usage` budget.

## Write a custom strategy

`defineHarnessContextStrategy()` takes a `name` and a `compact` function. `compact` receives the `messages`, the `step`, the `model`, the `signal` and a `summarize(messages)` helper; it returns a new message list, or `undefined` to leave the history unchanged.

`context` accepts one strategy. This one combines both built-in strategies:

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

`instructions` accepts text, a `defineHarnessInstructions()` resolver, or a list of both. Outpost resolves them at the start of each turn and joins them with blank lines; empty results are skipped.

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
console.log(
  review.name,
  review.tools.map((tool) => tool.name),
);
```

<!-- check:run -->

The script prints `review [ 'git' ]`: the skill name and the tools it unlocks. Pass it with `createHarness({ skills: [review] })`.

<!-- flow -->

1. **Advertise**: The system instructions list each skill’s name and description.
2. **Load**: The model calls `load_skill` with a skill name.
   - **Return the instructions**: Outpost resolves them and sends them back as the tool result.
   - **Unlock the tools**: The skill’s tools become callable for the rest of the conversation.
3. **Use**: The model follows the instructions and calls the skill’s tools.
   - **Before loading**: A skill tool call returns an error asking the model to load the skill.

`instructions` can be a resolver, as for the harness; it runs when the model loads the skill. Skill names use 1 to 64 letters, digits, `_` or `-` and must be unique; skill tools share the harness tool namespace ([Tools](../harness-tools/)).

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
