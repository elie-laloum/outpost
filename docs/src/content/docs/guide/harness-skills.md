---
title: "Give the harness instructions and skills"
description: "Load project guidance and offer task-specific skills to the model."
---

Use instructions for guidance that applies to every turn, and skills for guidance the model can load for a particular task. Start with a [working harness](../harness/). These declarations guide the model; enforced restrictions belong in [tool permissions](../harness-permissions/).

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
// Example output: review [ 'git' ]
```

<!-- check:run -->

The script prints `review [ 'git' ]`: the skill name and the tools it unlocks. Pass it with `createHarness({ skills: [review] })`.

1. The model sees the available skill names and descriptions.
2. It calls `load_skill` to read one skill's instructions and unlock its tools.
3. It follows those instructions and can use the tools for the rest of the conversation.

Calling a skill tool before loading its skill returns an error.

API reference: [HarnessInstructionsOption](../../reference/harnessinstructionsoption/) and [HarnessSkillOptions](../../reference/harnessskilloptions/).

:::caution
A skill guides the model; it enforces nothing. To block a tool, use [permissions](../harness-permissions/); to require a decision before continuing, use [approvals](../approvals/).
:::

## Account for history and tool cost

- A compaction that removes the `load_skill` call locks that skill’s tools again until the model reloads it.
- Skill tool definitions are sent with every request, loaded or not; skills save instruction text, not tool schemas.

[History management](../harness-context/) explains compaction.
