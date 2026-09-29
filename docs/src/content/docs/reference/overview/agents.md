---
title: "Agents — Overview"
description: "An agent composes an execution harness with a model."
sidebar:
  label: Overview
  order: 0
---

An agent composes an execution harness with a model. A harness defines how the task runs; the model is a name, or an `AgentModel` object that adds a reasoning level and an output limit. Constructing this configuration performs no login, allocation or network request.

## How it works

Use `createAgent({ harness: createCodexHarness(), model: "..." })`, or the corresponding `createClaudeHarness()`, `createAntigravityHarness()`, `createCopilotHarness()` and `createKimiHarness()` presets. `createHarness({ modelProvider, tools, instructions })` lets Outpost drive a model service itself. `sandboxProvider` independently selects where repository commands execute.

`createAgent()` normalizes the model into a frozen `AgentModel` and asks the harness or its model provider to validate it. A reasoning level or output limit that the selected CLI or service cannot express is rejected immediately, before any sandbox exists. Antigravity, Copilot and Kimi accept only a model name; Kimi with `usage` authentication requires one.

`createFallbackAgent([...agents], { on })` groups composed agents into an ordered `FallbackAgent`. Dispatch accepts it wherever it accepts an agent (`DispatchAgent`) and hands the work to the next candidate only when the current one fails with a listed `FallbackTrigger`: `quota` or `unavailable`. The result's `FallbackRecord` names the selected candidate and the `FallbackAttempt` of each one that stopped. Attachment and explicit continuations require a single agent.

## Boundaries and responsibilities

An agent binds execution configuration and model selection. The [Harness](../harness/) family owns CLI presets, the built-in engine, authentication settings (`AgentAuthentication`, `AccountCredential`, `UsageCredential`) and execution capabilities. [Model providers](../model-providers/) supply HTTP transports to custom harnesses, while `sandboxProvider` independently selects the execution environment.

These composition APIs are available since 5.0.0. Use the agent with dispatch, a sandbox or a workflow task; constructing it performs no execution.

## Entry points

- [createAgent](../../createagent/)
- [Agent](../../type-agent/)
- [AgentOptions](../../agentoptions/)
- [CliAgent](../../cliagent/)
- [CustomAgent](../../customagent/)
- [AgentModel](../../agentmodel/)
- [ModelSpec](../../modelspec/)
- [ModelReasoning](../../modelreasoning/)
- [createFallbackAgent](../../createfallbackagent/)
- [FallbackAgent](../../type-fallbackagent/)

[Learn with the practical guide](../../../guide/choose-an-agent/).
