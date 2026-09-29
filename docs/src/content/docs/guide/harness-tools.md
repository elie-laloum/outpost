---
title: "Tools"
description: "Expose a bounded set of sandbox operations to a model."
---

For the built-in model loop, pass tools to `createHarness({ tools })`. Built-in toolsets cover files, search, edits, Git and shell commands.

## Define a tool

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";

const gitStatus = defineHarnessTool({
  name: "git_status",
  description: "Read the working tree status.",
  input: { type: "object", properties: {}, additionalProperties: false },
  readOnly: true,
  async execute(_input, { sandbox, signal }) {
    const result = await sandbox.invoke({
      executable: "git",
      arguments: ["status", "--short"],
      signal,
    });
    return {
      content: result.stdout || result.stderr,
      isError: result.status !== 0,
    };
  },
});
```

`input` accepts JSON Schema or a compatible Standard Schema with JSON Schema support. Validation runs before `execute`. Tool names must be unique, including names in nested toolsets and skills.

## Compose tools

`defineHarnessToolset({ name, tools })` groups reusable tools. `createHarnessFileTools()`, `createHarnessSearchTools()`, `createHarnessEditTools()`, `createHarnessGitTools()` and `createHarnessShellTools()` provide ready-made sets. Supply only the capabilities the task needs.

`readOnly` is scheduling metadata, not isolation. Declare `resources(input)` when permission rules need to inspect paths or commands. Use `context.sandbox` for execution and honor `context.signal`; host filesystem calls would bypass the borrowed sandbox.

To use tools from an existing server, declare [MCP servers](../mcp-servers/) with `createHarness({ mcpServers })`.

API: [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessToolset](../../reference/defineharnesstoolset/) · [HarnessToolContext](../../reference/harnesstoolcontext/).
