---
title: "Agents — Overview"
description: "An agent composes an execution harness with a model."
sidebar:
  label: Overview
  order: 0
---

An agent composes an execution harness with a model. A harness defines how the task runs; the model is a name, or an `AgentModel` object that adds a reasoning level and an output limit. Constructing this configuration performs no login, allocation or network request.

## How it works

Use `agent({ harness: codexHarness(), model: "..." })`, or the corresponding `claudeHarness()` and `geminiHarness()` presets. `harness({ modelProvider, run })` connects a caller-supplied callback to a model service. `sandboxProvider` independently selects where repository commands execute.

`agent()` normalizes the model into a frozen `AgentModel` and asks the harness or its model provider to validate it. A reasoning level or output limit that the selected CLI or service cannot express is rejected immediately, before any sandbox exists.

## Boundaries and responsibilities

An agent binds execution configuration and model selection. The [Harness](../harness/) family owns CLI presets, custom callbacks, authentication settings and execution capabilities. [Model providers](../model-providers/) supply HTTP transports to custom harnesses, while `sandboxProvider` independently selects the execution environment.

These composition APIs are available since 5.0.0. Use the agent with dispatch, a sandbox or a workflow task; constructing it performs no execution.

## Entry points

- [agent](../../agent/)
- [Agent](../../type-agent/)
- [AgentOptions](../../agentoptions/)
- [CliAgent](../../cliagent/)
- [CustomAgent](../../customagent/)
- [AgentModel](../../agentmodel/)
- [ModelSpec](../../modelspec/)
- [ModelReasoning](../../modelreasoning/)

[Learn with the practical guide](../../../guide/agents/adapters/).
