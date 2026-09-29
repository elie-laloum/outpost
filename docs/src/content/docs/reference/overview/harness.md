---
title: "Harness — Overview"
description: "A harness defines how an agent executes a task and accesses its model."
sidebar:
  label: Overview
  order: 0
---

A harness defines how an agent executes a task and accesses its model. CLI presets and the Outpost engine are composed with a model using `agent({ harness, model })`. This family groups their factories, tool and instruction definitions, execution contracts, settings and CLI protocol adapters.

## How it works

Choose `claudeHarness()`, `codexHarness()`, `antigravityHarness()`, `copilotHarness()` or `kimiHarness()` to delegate execution to the corresponding CLI. Their settings configure execution, explicit authentication and supported conversation behavior. `authentication` takes an [`AgentAuthentication`](../../agentauthentication/): `"account"` reuses the CLI's own login, optionally through an [`AccountCredential`](../../accountcredential/) (`file`, `key` or `variable`), while `"usage"` bills an API key, optionally through a [`UsageCredential`](../../usagecredential/) (`key` or `variable`). Each preset accepts only the forms its CLI supports and rejects the others when the agent is composed. Without `authentication`, Outpost prepares no credential.

Use `harness()` to let Outpost drive the model itself. It combines a [model provider](../model-providers/), tools from `defineHarnessTool()` and `defineHarnessToolset()`, instructions from text or `defineHarnessInstructions()`, hooks, permissions, loop limits and tool execution settings. Select the model on the [agent](../agents/); a custom harness requires an explicit model, while a CLI preset can keep its native default.

Both variants accept `mcpServers`, a [`McpServers`](../../mcpservers/) map of stdio ([`McpStdioServer`](../../mcpstdioserver/)) or HTTP ([`McpHttpServer`](../../mcphttpserver/)) servers. CLI presets translate it into their native configuration, planned by `AgentAdapter.configuration` as [`AgentConfiguration`](../../agentconfiguration/) files when a CLI reads it from its home; the Outpost engine starts the servers inside the sandbox for each turn and exposes their tools as `mcp__<server>__<tool>`.

The built-in engine returns a [`Harness`](../../type-customharness/) configured with [`HarnessOptions`](../../customharnessoptions/). [`AgentHarness`](../../harness/) is the union `CliHarness | Harness` for code that accepts either execution variant.

## Boundaries and responsibilities

Constructing a harness starts no process, login or network request; host credential files are read only when a sandbox is prepared, and Outpost never reads a system keychain. A CLI owns its internal model/tool loop. Claude Code and Codex support native capture, resume and fork; Kimi also supports capture, resume and fork; Copilot supports capture and resume; Antigravity resumes only in the same open sandbox. Their models remain names without `reasoning` or `maxOutputTokens`.

The Outpost engine runs in the Outpost process. Each step is one model request; tools run through the borrowed sandbox, and limits fail the turn with the `limit` code instead of succeeding. Turns are recorded as transcripts that support continuation, fork and response repairs, and context strategies can compact long histories. Interactive attachment is unsupported. `AgentAdapter` and `AgentInput` describe CLI command construction and event decoding. Sandbox allocation belongs to [Providers](../providers/).

CLI presets are stable since 5.0.0. The built-in engine and its definitions are stable in 7.0.0. `defineHarnessSubagent()` exposes a built-in child as a serialized tool with its own history and limits; it borrows the sandbox and its tokens also count toward ancestor budgets.

## Entry points

- [harness](../../function-harness/) composes the Outpost engine.
- [defineHarnessTool](../../defineharnesstool/), [defineHarnessToolset](../../defineharnesstoolset/) and [defineHarnessInstructions](../../defineharnessinstructions/) declare what the engine can use.
- [harnessFileTools](../../harnessfiletools/), [harnessEditTools](../../harnessedittools/), [harnessSearchTools](../../harnesssearchtools/), [harnessGitTools](../../harnessgittools/) and [harnessShellTools](../../harnessshelltools/) provide repository tools.
- [defineHarnessContextStrategy](../../defineharnesscontextstrategy/), [truncateToolResults](../../truncatetoolresults/) and [summarizeHistory](../../summarizehistory/) keep long histories within the model context.
- [defineHarnessSkill](../../defineharnessskill/) packages instructions and tools that the model loads on demand.
- [defineHarnessHook](../../defineharnesshook/) and [defineHarnessPermissions](../../defineharnesspermissions/) control tool calls and the end of the loop.
- [claudeHarness](../../claudeharness/), [codexHarness](../../codexharness/), [antigravityHarness](../../antigravityharness/), [copilotHarness](../../copilotharness/) and [kimiHarness](../../kimiharness/) configure the CLI presets with [ClaudeSettings](../../claudesettings/), [CodexSettings](../../codexsettings/), [AntigravitySettings](../../antigravitysettings/), [CopilotSettings](../../copilotsettings/) and [KimiSettings](../../kimisettings/).
- [AgentAuthentication](../../agentauthentication/), [AccountCredential](../../accountcredential/) and [UsageCredential](../../usagecredential/) select how a CLI preset authenticates.
- [McpServers](../../mcpservers/), [McpServer](../../mcpserver/), [McpStdioServer](../../mcpstdioserver/) and [McpHttpServer](../../mcphttpserver/) declare MCP servers for either variant; see [MCP servers](../../../guide/mcp-servers/).
- [agentVersions](../../agentversions/) lists the CLI versions pinned for generated images and remote bootstrap, including Antigravity archives verified against pinned SHA-512 digests.
- [Harness](../../harness/) is the shared composition contract.
- [HarnessToolContext](../../harnesstoolcontext/) describes the sandbox, cancellation signal, model and observer available to a tool.
- [AgentAdapter](../../agentadapter/) describes the CLI protocol adapter.
- [AgentConfiguration](../../agentconfiguration/) and [ConfigurationFile](../../configurationfile/) describe CLI configuration merged into the agent home.

[Learn with the practical guide](../../../guide/agents/harness/). For CLI presets, see [the adapters guide](../../../guide/agents/adapters/) and [authentication](../../../guide/manual/authentication/).
