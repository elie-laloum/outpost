---
title: "Harness — Overview"
description: "A harness defines how an agent executes a task and accesses its model."
sidebar:
  label: Overview
  order: 0
---

A harness defines how an agent executes a task and accesses its model. CLI presets and the Outpost engine are composed with a model using `agent({ harness, model })`. This family groups their factories, tool and instruction definitions, execution contracts, settings and CLI protocol adapters.

## How it works

Choose `claudeHarness()`, `codexHarness()` or `geminiHarness()` to delegate execution to the corresponding CLI. Their options configure execution, explicit authentication and supported conversation behavior.

Use `harness()` to let Outpost drive the model itself. It combines a [model provider](../model-providers/), tools from `defineHarnessTool()` and `defineHarnessToolset()`, instructions from text or `defineHarnessInstructions()`, hooks, permissions, loop limits and tool execution settings. Select the model on the [agent](../agents/); a custom harness requires an explicit model, while a CLI preset can keep its native default.

## Boundaries and responsibilities

Constructing a harness starts no process, login or network request. A CLI owns its internal model/tool loop. Claude and Codex support native capture, resume and fork; Gemini supports fresh sessions.

The Outpost engine runs in the Outpost process. Each step is one model request; tools run through the borrowed sandbox, and limits fail the turn with the `limit` code instead of succeeding. Turns are recorded as transcripts that support continuation, fork and response repairs, and context strategies can compact long histories. Interactive attachment is unsupported. `AgentAdapter` and `AgentInput` describe CLI command construction and event decoding. Sandbox allocation belongs to [Providers](../providers/).

CLI presets are stable since 5.0.0; the engine and its definitions are experimental.

## Entry points

- [harness](../../function-harness/) composes the Outpost engine.
- [defineHarnessTool](../../defineharnesstool/), [defineHarnessToolset](../../defineharnesstoolset/) and [defineHarnessInstructions](../../defineharnessinstructions/) declare what the engine can use.
- [harnessFileTools](../../harnessfiletools/), [harnessEditTools](../../harnessedittools/), [harnessSearchTools](../../harnesssearchtools/), [harnessGitTools](../../harnessgittools/) and [harnessShellTools](../../harnessshelltools/) provide repository tools.
- [defineHarnessContextStrategy](../../defineharnesscontextstrategy/), [truncateToolResults](../../truncatetoolresults/) and [summarizeHistory](../../summarizehistory/) keep long histories within the model context.
- [defineHarnessSkill](../../defineharnessskill/) packages instructions and tools that the model loads on demand.
- [defineHarnessHook](../../defineharnesshook/) and [defineHarnessPermissions](../../defineharnesspermissions/) control tool calls and the end of the loop.
- [claudeHarness](../../claudeharness/), [codexHarness](../../codexharness/) and [geminiHarness](../../geminiharness/) configure the CLI presets.
- [Harness](../../harness/) is the shared composition contract.
- [HarnessToolContext](../../harnesstoolcontext/) describes the sandbox, cancellation signal, model and observer available to a tool.
- [AgentAdapter](../../agentadapter/) describes the CLI protocol adapter.

[Learn with the practical guide](../../../guide/agents/harness/). For CLI presets, see [the adapters guide](../../../guide/agents/adapters/).
