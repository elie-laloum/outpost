---
title: "Agents — Overview"
description: "An agent composes an execution harness with a model identifier."
sidebar:
  label: Overview
  order: 0
---

An agent composes an execution harness with a model identifier. A harness defines how the task runs; the selected model is a string passed to the CLI or model service. Constructing this configuration performs no login, allocation or network request.

## How it works

Use `agent({ harness: codex.harness(), model: "..." })`, or the corresponding `claude.harness()` and `gemini.harness()` presets. `customHarness({ modelProvider, run })` connects a caller-supplied callback to a model service. `sandboxProvider` independently selects where repository commands execute.

## Boundaries and responsibilities

The CLI owns its internal model/tool loop. Claude and Codex preserve native capture, resume and fork; Gemini supports fresh sessions. A custom callback runs in the Outpost process, borrows its sandbox, and cooperates with cancellation. It has no native conversations, automatic repairs or interactive attachment. The built-in tool engine remains planned.

These composition APIs are implemented but unreleased. [Model providers](../model-providers/) handle bounded text requests; they do not allocate a sandbox.

## Entry points

- [agent](../../agent/)
- [customHarness](../../customharness/)
- [claude](../../claude/)
- [codex](../../codex/)
- [gemini](../../gemini/)
- [AgentAdapter](../../agentadapter/)

[Learn with the practical guide](../../../guide/agents/adapters/).
