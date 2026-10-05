---
title: "Give the model tools"
description: "Choose sandbox tools or define your own tools for the built-in harness."
---

## Give the model ready-made tools

Pass the tools or toolsets the model needs to `createHarness({ tools })`. The model can call only this declared set, so start with the tools required by the task.

<!-- tabs -->

```ts title="read-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="read-tools.ts"
import {
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

export const tools = [
  createHarnessFileTools(),
  createHarnessSearchTools(),
  createHarnessGitTools(),
];
```

```ts title="reviewer.ts"
import { createAgent, createHarness } from "@elie-laloum/outpost";
import { modelProvider } from "./read-model.ts";
import { tools } from "./read-tools.ts";

export const reviewer = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({ modelProvider, tools }),
});
```

```ts title="review.ts"
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { reviewer } from "./reviewer.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reviewer,
  brief: { text: "Review the last commit and report risky changes." },
});
console.log(result.text);
```

This reviewer reads, searches and inspects history, but cannot change a file. Every call runs in the dispatch’s sandbox, against the repository root.

## Choose the toolsets

| Toolset                      | Tools                     | Read-only | What the model can do                                                                  |
| ---------------------------- | ------------------------- | --------- | -------------------------------------------------------------------------------------- |
| `createHarnessFileTools()`   | `read_file`, `list_files` | Yes       | Read UTF-8 files and list files tracked or not ignored by Git.                         |
| `createHarnessSearchTools()` | `search`                  | Yes       | Search files with an extended regular expression (`git grep`), by path, glob and case. |
| `createHarnessGitTools()`    | `git`                     | Yes       | Run `git status`, `diff`, `log` or `show` with extra arguments.                        |
| `createHarnessEditTools()`   | `write_file`, `edit_file` | No        | Create files and replace text within existing files.                                   |
| `createHarnessShellTools()`  | `shell`                   | No        | Run a `sh -c` command without input and read its exit status and output.               |

Paths must stay inside the repository. To configure command limits, see [createHarnessShellTools](../../reference/createharnessshelltools/).

## Define a tool

This tool lets the model run tests inside the sandbox. The model can request the whole suite or select tests by name.

<!-- tabs -->

```ts title="test-input.ts"
import { z } from "zod";

export const testInput = z.object({ match: z.string().optional() });
export type TestInput = z.infer<typeof testInput>;
```

```ts title="execute-tests.ts"
import type { TestInput } from "./test-input.ts";
import type { HarnessToolContext } from "@elie-laloum/outpost";

export async function executeTests(
  { match }: TestInput,
  { sandbox, signal }: HarnessToolContext,
) {
  const result = await sandbox.invoke({
    executable: "npm",
    arguments: [
      "test",
      ...(match ? ["--", `--test-name-pattern=${match}`] : []),
    ],
    signal,
  });
  return {
    content: result.stdout + result.stderr,
    isError: result.status !== 0,
  };
}
```

```ts title="run-tests.ts"
import { defineHarnessTool } from "@elie-laloum/outpost";
import { testInput } from "./test-input.ts";
import { executeTests } from "./execute-tests.ts";

export const runTests = defineHarnessTool({
  name: "run_tests",
  description:
    "Run the test suite, optionally only the tests whose name matches.",
  input: testInput,
  resources: ({ match }) => ({ command: `npm test ${match ?? ""}`.trim() }),
  execute: executeTests,
});
```

API reference: [HarnessToolOptions](../../reference/harnesstooloptions/), [HarnessToolContext](../../reference/harnesstoolcontext/) and [ToolOutput](../../reference/tooloutput/).

A tool name must contain 1 to 64 letters, digits, `_` or `-`. By default, an execution error is sent back to the model as a failed tool result. Set `toolExecution.onError: "fail"` to stop the turn instead; see [Built-in harness](../harness/).

## Group tools into a toolset

`defineHarnessToolset()` bundles tools and other toolsets under one name, so you can share them between harnesses.

<!-- tabs -->

```ts title="inspect-tools.ts"
import {
  defineHarnessToolset,
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessGitTools,
} from "@elie-laloum/outpost";

export const inspect = defineHarnessToolset({
  name: "inspect",
  tools: [
    createHarnessFileTools(),
    createHarnessSearchTools(),
    createHarnessGitTools(),
  ],
});
```

```ts title="coding-tools.ts"
import {
  defineHarnessToolset,
  createHarnessEditTools,
  createHarnessShellTools,
} from "@elie-laloum/outpost";
import { inspect } from "./inspect-tools.ts";

export const coding = defineHarnessToolset({
  name: "coding",
  tools: [inspect, createHarnessEditTools(), createHarnessShellTools()],
});
```

Each tool name must be unique across the harness: its tools, nested toolsets and [skill](../harness-context/) tools. A duplicate fails when you create the harness.

## Use tools from an MCP server

To expose an existing server’s tools, declare it with `createHarness({ mcpServers })`. [MCP servers](../mcp-servers/) covers the configuration; its tool names share the same namespace.

## Limits

- `execute` runs in the Outpost process on the host. Use `context.sandbox` for files and commands; host APIs such as `node:fs` would bypass the sandbox.
- `readOnly` is a scheduling hint, not enforcement. A tool marked read-only can still write if its code does.
- A result longer than 100,000 characters is truncated before it reaches the model.

API: [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessToolset](../../reference/defineharnesstoolset/) · [HarnessToolContext](../../reference/harnesstoolcontext/) · [ToolOutput](../../reference/tooloutput/) · [ToolResources](../../reference/toolresources/) · [createHarnessFileTools](../../reference/createharnessfiletools/) · [createHarnessSearchTools](../../reference/createharnesssearchtools/) · [createHarnessGitTools](../../reference/createharnessgittools/) · [createHarnessEditTools](../../reference/createharnessedittools/) · [createHarnessShellTools](../../reference/createharnessshelltools/).
