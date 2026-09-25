---
title: "Agents — Overview"
description: "An agent composes an execution harness with a model identifier."
sidebar:
  label: Overview
  order: 0
---

An agent composes an execution harness with a model identifier. A harness defines how the task runs; the selected model is a string passed to the CLI or model service. Constructing this configuration performs no login, allocation or network request.

## How it works

Use `agent({ harness: codexHarness(), model: "..." })`, or the corresponding `claudeHarness()` and `geminiHarness()` presets. `harness({ modelProvider, run })` connects a caller-supplied callback to a model service. `sandboxProvider` independently selects where repository commands execute.

## Boundaries and responsibilities

An agent binds execution configuration and model selection. The [Harness](../harness/) family owns CLI presets, custom callbacks, authentication settings and execution capabilities. [Model providers](../model-providers/) supply HTTP transports to custom harnesses, while `sandboxProvider` independently selects the execution environment.

These composition APIs are implemented but unreleased. Use the agent with dispatch, a sandbox or a workflow task; constructing it performs no execution.

## Entry points

- [agent](../../agent/)
- [Agent](../../type-agent/)
- [AgentOptions](../../agentoptions/)
- [CliAgent](../../cliagent/)
- [CustomAgent](../../customagent/)

[Learn with the practical guide](../../../guide/agents/adapters/).
