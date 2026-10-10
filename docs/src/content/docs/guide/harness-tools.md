---
title: "Give the model tools"
description: "Choose sandbox tools or define your own tools for the built-in harness."
---

Start from a [working harness](../harness/). Give it the smallest useful toolset, then add a custom tool only when the model needs another operation. All file and command effects should use the sandbox supplied to the tool.

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
// Example output: The last commit accepts unchecked input in src/parser.ts.
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

<span id="define-a-tool"></span>
<span id="group-tools-into-a-toolset"></span>

For this step, follow [Create a tool for your agent](../custom-harness-tools/).

## Use tools from an MCP server

To expose an existing server’s tools, declare it with `createHarness({ mcpServers })`. [MCP servers](../mcp-servers/) covers the configuration; its tool names share the same namespace.

## File workspaces

Listing and search default to Git selection for existing calls. Select `filesystem` explicitly for file workspaces; these operations run inside the borrowed sandbox, keep permission declarations and bounds, and do not follow links or apply `.gitignore`. See [file workspaces](../workspaces/).

## Limits

- `execute` runs in the Outpost process on the host. Use `context.sandbox` for files and commands; host APIs such as `node:fs` would bypass the sandbox.
- `readOnly` is a scheduling hint, not enforcement. A tool marked read-only can still write if its code does.
- A result longer than 100,000 characters is truncated before it reaches the model.

API: [defineHarnessTool](../../reference/defineharnesstool/) · [defineHarnessToolset](../../reference/defineharnesstoolset/) · [HarnessToolContext](../../reference/harnesstoolcontext/) · [ToolOutput](../../reference/tooloutput/) · [ToolResources](../../reference/toolresources/) · [createHarnessFileTools](../../reference/createharnessfiletools/) · [createHarnessSearchTools](../../reference/createharnesssearchtools/) · [createHarnessGitTools](../../reference/createharnessgittools/) · [createHarnessEditTools](../../reference/createharnessedittools/) · [createHarnessShellTools](../../reference/createharnessshelltools/).
