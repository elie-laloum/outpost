---
title: "Tools"
description: "Give the built-in harness ready-made file, search, edit, Git and shell tools, or write your own tools that run in the sandbox."
---

## Give the model ready-made tools

Pass toolsets to `createHarness({ tools })`. The model can only call the tools you list, so give it the smallest set the task needs.

```ts
import {
  createAgent,
  createAnthropicModelProvider,
  createHarness,
  createHarnessFileTools,
  createHarnessSearchTools,
  createHarnessGitTools,
  dispatch,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const reviewer = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: createAnthropicModelProvider({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    }),
    tools: [
      createHarnessFileTools(),
      createHarnessSearchTools(),
      createHarnessGitTools(),
    ],
  }),
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reviewer,
  brief: { text: "Review the last commit and report risky changes." },
});
console.log(result.text);
```

This reviewer reads, searches and inspects history, but cannot change a file. Every call runs in the dispatch’s sandbox, against the repository root.

## Choose the toolsets

| Toolset                      | Tools                     | Read-only | What the model can do                                                                                                  |
| ---------------------------- | ------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `createHarnessFileTools()`   | `read_file`, `list_files` | Yes       | Read a UTF-8 file with numbered lines (`offset`, `limit`); list files tracked or not ignored by Git, filtered by glob. |
| `createHarnessSearchTools()` | `search`                  | Yes       | Search files with an extended regular expression (`git grep`), by path, glob and case.                                 |
| `createHarnessGitTools()`    | `git`                     | Yes       | Run `git status`, `diff`, `log` or `show` with extra arguments.                                                        |
| `createHarnessEditTools()`   | `write_file`, `edit_file` | No        | Create or replace a file; replace an exact text that appears once, or everywhere with `replace_all`.                   |
| `createHarnessShellTools()`  | `shell`                   | No        | Run a `sh -c` command without input and read its exit status and output.                                               |

Paths are relative to the repository root and must stay inside it. `createHarnessShellTools({ deadlineMs })` bounds each command; the default is 120 seconds.

## Define a tool

`defineHarnessTool()` declares a name, a description for the model, an input schema and an `execute(input, context)` function. The input is validated before `execute` runs.

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";
import { z } from "zod";

export const runTests = defineHarnessTool({
  name: "run_tests",
  description:
    "Run the test suite, optionally only the tests whose name matches.",
  input: z.object({ match: z.string().optional() }),
  resources: ({ match }) => ({ command: `npm test ${match ?? ""}`.trim() }),
  async execute({ match }, { sandbox, signal }) {
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
  },
});
```

<!-- features -->

- `input`: A JSON Schema object, or a Standard Schema that converts to JSON Schema, such as Zod.
- `execute`: Returns a string, or `{ content, isError }` to report a failure to the model.
- `context.sandbox`: Runs commands (`invoke`) and moves files (`upload`, `download`) in the borrowed sandbox.
- `context.signal`: Aborts when the call deadline expires or the dispatch is cancelled.
- `readOnly`: Marks a tool that changes nothing: the loop runs it alongside other read-only calls and keeps it during response repairs.
- `resources(input)`: Returns the `paths` or `command` a call touches, for [permission rules](../harness-permissions/).

Tool names use 1 to 64 letters, digits, `_` or `-`. A thrown error returns its message to the model unless `toolExecution.onError` is `"fail"` (see [Built-in harness](../harness/)).

## Group tools into a toolset

`defineHarnessToolset()` bundles tools and other toolsets under one name, so you can share them between harnesses.

```ts
import {
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessGitTools,
  createHarnessSearchTools,
  createHarnessShellTools,
  defineHarnessToolset,
} from "@elie-laloum/outpost";

export const inspect = defineHarnessToolset({
  name: "inspect",
  tools: [
    createHarnessFileTools(),
    createHarnessSearchTools(),
    createHarnessGitTools(),
  ],
});

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
