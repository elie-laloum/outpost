---
title: "Harness — Overview"
description: "Choose who runs the agent loop, then build the built-in harness from tools, instructions, limits, permissions, hooks and subagents."
sidebar:
  label: Overview
  order: 0
---

## Choose a harness

`createAgent({ harness, model })` pairs either kind of harness with a model, and the agent then runs through `dispatch()`.

|               | CLI preset (`createClaudeHarness()`, `createCodexHarness()`, …) | Built-in harness (`createHarness()`)                                             |
| ------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Model loop    | The agent CLI, inside the sandbox                               | Outpost, in your Node.js process: one model request per step                     |
| Model         | Optional; the CLI default applies                               | Required, validated by the model provider                                        |
| Model access  | Account login or API key, chosen by `authentication`            | A [model provider](../model-providers/) with an API key                          |
| Tools         | The CLI’s own                                                   | Only the tools you declare, run through the borrowed sandbox                     |
| Conversations | Native session files; capture, resume and fork vary by CLI      | Transcripts, by default under `.outpost/conversations/harness/`; resume and fork |
| Steering      | Live input (Claude Code, Codex), otherwise stop and resume      | Added to the running loop before its next model request                          |
| MCP servers   | Written into the CLI’s native configuration                     | Started inside the sandbox for each turn; the lease must support `liveInput`     |
| Bounds        | CLI settings and dispatch deadlines                             | `limits`: steps, tool calls, delegation depth and tokens, failing with `limit`   |

## Build a built-in harness

Pass each building block to `createHarness()`. Definitions are validated when declared and throw code `configuration` on invalid input.

| Building block | Declare with                                                                               | Role in the loop                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Tools          | `defineHarnessTool()`, `defineHarnessToolset()`, `createHarnessFileTools()` and other sets | Input checked against the schema; consecutive read-only calls run in parallel, others alone          |
| Instructions   | Text, `defineHarnessInstructions()`, `defineMcpPrompt()`                                   | Resolved into the system prompt at the start of each turn                                            |
| Limits         | `limits`, `toolExecution`                                                                  | Defaults: 100 steps, 4 parallel read-only calls, 300000 ms per tool call                             |
| Permissions    | `defineHarnessPermissions()`                                                               | Allow or deny each call by tool name, path or command; the first matching rule decides               |
| Hooks          | `defineHarnessHook()`                                                                      | Add instructions, rewrite or deny a tool call, replace its result, or refuse the final answer        |
| Context        | `truncateToolResults()`, `summarizeHistory()`, `defineHarnessContextStrategy()`            | Rewrites the history before each model request                                                       |
| Skills         | `defineHarnessSkill()`                                                                     | Listed in the system prompt; `load_skill` returns the instructions and unlocks the tools             |
| Subagents      | `defineHarnessSubagent()`                                                                  | A tool that runs a built-in child in the same sandbox; its tokens count toward every ancestor budget |
| MCP servers    | `mcpServers`                                                                               | Adds `mcp__<server>__<tool>` tools for the turn                                                      |

:::caution
Permissions and hooks decide what the model may ask for; they do not isolate anything. The sandbox is the boundary, and shell commands can evade command patterns.
:::

## Entry points

Guide: [Built-in harness](../../../guide/harness/) · [Tools](../../../guide/harness-tools/) · [Permissions and hooks](../../../guide/harness-permissions/)

- [createHarness](../../createharness/)
- [defineHarnessTool](../../defineharnesstool/)
- [defineHarnessToolset](../../defineharnesstoolset/)
- [createHarnessFileTools](../../createharnessfiletools/)
- [defineHarnessPermissions](../../defineharnesspermissions/)
- [defineHarnessHook](../../defineharnesshook/)
- [summarizeHistory](../../summarizehistory/)
- [defineHarnessSkill](../../defineharnessskill/)
- [defineHarnessSubagent](../../defineharnesssubagent/)
- [HarnessOptions](../../customharnessoptions/)
- [HarnessLimits](../../harnesslimits/)
- [CliHarness](../../cliharness/)
