---
title: "Harness — Overview"
description: "A harness defines how an agent executes a task and accesses its model."
sidebar:
  label: Overview
  order: 0
---

A harness defines how an agent executes a task and accesses its model. CLI presets and caller-defined harnesses are composed with a model identifier using `agent({ harness, model })`. This family groups their factories, execution contracts, settings and CLI protocol adapters.

## How it works

Choose `claudeHarness()`, `codexHarness()` or `geminiHarness()` to delegate execution to the corresponding CLI. Their options configure execution, explicit authentication and supported conversation behavior. Use `harness({ modelProvider, run })` to supply your own execution callback backed by a [model provider](../model-providers/). Select the model on the [agent](../agents/); a custom harness requires an explicit model, while a CLI preset can keep its native default.

## Boundaries and responsibilities

Constructing a harness starts no process, login or network request. The CLI owns its internal model/tool loop. Claude and Codex support native capture, resume and fork; Gemini supports fresh sessions.

A custom callback runs in the Outpost process, borrows its sandbox for repository operations and cooperates with cancellation. It has no native conversations, automatic response repairs or interactive attachment. The generic tool engine remains planned. `AgentAdapter` and `AgentInput` describe CLI command construction and event decoding; `HarnessInput`, `HarnessContext` and `HarnessRun` describe custom execution. Sandbox allocation belongs to [Providers](../providers/).

These harness APIs are implemented but unreleased.

## Entry points

- [harness](../../function-harness/) defines your execution callback.
- [claudeHarness](../../claudeharness/), [codexHarness](../../codexharness/) and [geminiHarness](../../geminiharness/) configure the CLI presets.
- [Harness](../../harness/) is the shared composition contract.
- [HarnessContext](../../harnesscontext/) describes the model, provider, sandbox, cancellation signal and observer available to a callback.
- [AgentAdapter](../../agentadapter/) describes the CLI protocol adapter.

[Learn with the practical guide](../../../guide/agents/adapters/). For a complete callback example, see [model providers and custom harnesses](../../../guide/advanced/model-providers/).
