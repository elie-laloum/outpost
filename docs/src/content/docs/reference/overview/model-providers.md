---
title: "Model providers — Overview"
description: "A model provider sends text requests directly to a model API, independently of sandbox allocation."
sidebar:
  label: Overview
  order: 0
---

:::caution[Experimental]
This family exposes direct text calls only. The agent harness for tools, repository edits and conversations is planned for phase two; these contracts may change.
:::

A model provider sends text requests directly to a model API. The experimental first implementation, `openaiCompatible()`, works without Codex through Chat Completions or Responses. A sandbox provider separately owns the environment where commands execute.

## How it works

Create the client with an explicit API base URL, model and bearer key (or false for no authentication), then call `generate()` with text. Each call runs in the calling process, owns its deadline and returns complete text plus optional reported usage. No sandbox is allocated.

## Boundaries and responsibilities

Phase one supports non-streaming text only. Tool execution, repository editing, conversation storage and dispatch integration await the agent harness in phase two. The client rejects unsupported responses and performs no automatic retries. Its public contracts remain experimental; local HTTP fixtures do not establish live service compatibility.

## Entry points

- [openaiCompatible](../../openaicompatible/)
- [OpenAICompatibleOptions](../../openaicompatibleoptions/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)

[Learn with the practical guide](../../../guide/advanced/model-providers/).
