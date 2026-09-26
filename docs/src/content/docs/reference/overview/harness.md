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

The built-in engine returns a [`Harness`](../../type-customharness/) configured with [`HarnessOptions`](../../customharnessoptions/). [`AgentHarness`](../../harness/) is the union `CliHarness | Harness` for code that accepts either execution variant.

## Boundaries and responsibilities

Constructing a harness starts no process, login or network request; host credential files are read only when a sandbox is prepared, and Outpost never reads a system keychain. A CLI owns its internal model/tool loop. Claude Code and Codex support native capture, resume and fork; Antigravity, Copilot and Kimi support fresh sessions only, accept a model name without `reasoning` or `maxOutputTokens`, and require `repairs: 0`.

The Outpost engine runs in the Outpost process. Each step is one model request; tools run through the borrowed sandbox, and limits fail the turn with the `limit` code instead of succeeding. Turns are recorded as transcripts that support continuation, fork and response repairs, and context strategies can compact long histories. Interactive attachment is unsupported. `AgentAdapter` and `AgentInput` describe CLI command construction and event decoding. Sandbox allocation belongs to [Providers](../providers/).

CLI presets are stable since 5.0.0; the engine and its definitions are experimental.

## Entry points

- [harness](../../function-harness/) composes the Outpost engine.
- [defineHarnessTool](../../defineharnesstool/), [defineHarnessToolset](../../defineharnesstoolset/) and [defineHarnessInstructions](../../defineharnessinstructions/) declare what the engine can use.
- [harnessFileTools](../../harnessfiletools/), [harnessEditTools](../../harnessedittools/), [harnessSearchTools](../../harnesssearchtools/), [harnessGitTools](../../harnessgittools/) and [harnessShellTools](../../harnessshelltools/) provide repository tools.
- [defineHarnessContextStrategy](../../defineharnesscontextstrategy/), [truncateToolResults](../../truncatetoolresults/) and [summarizeHistory](../../summarizehistory/) keep long histories within the model context.
- [defineHarnessSkill](../../defineharnessskill/) packages instructions and tools that the model loads on demand.
- [defineHarnessHook](../../defineharnesshook/) and [defineHarnessPermissions](../../defineharnesspermissions/) control tool calls and the end of the loop.
- [claudeHarness](../../claudeharness/), [codexHarness](../../codexharness/), [antigravityHarness](../../antigravityharness/), [copilotHarness](../../copilotharness/) and [kimiHarness](../../kimiharness/) configure the CLI presets with [ClaudeSettings](../../claudesettings/), [CodexSettings](../../codexsettings/), [AntigravitySettings](../../antigravitysettings/), [CopilotSettings](../../copilotsettings/) and [KimiSettings](../../kimisettings/).
- [AgentAuthentication](../../agentauthentication/), [AccountCredential](../../accountcredential/) and [UsageCredential](../../usagecredential/) select how a CLI preset authenticates.
- [agentVersions](../../agentversions/) lists the CLI versions pinned for generated images and remote bootstrap; Antigravity has no entry because both install its current release with the official install script.
- [Harness](../../harness/) is the shared composition contract.
- [HarnessToolContext](../../harnesstoolcontext/) describes the sandbox, cancellation signal, model and observer available to a tool.
- [AgentAdapter](../../agentadapter/) describes the CLI protocol adapter.

[Learn with the practical guide](../../../guide/agents/harness/). For CLI presets, see [the adapters guide](../../../guide/agents/adapters/) and [authentication](../../../guide/manual/authentication/).
