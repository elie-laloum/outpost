---
title: "Model providers — Overview"
description: "A model provider supplies the request transport used by a custom harness."
sidebar:
  label: Overview
  order: 0
---

The `ModelProvider` contract and OpenAI adapter are stabilized for the next release. The Anthropic adapter remains experimental pending fresh authenticated delegation validation.

A model provider supplies the request transport used by a custom harness. `openaiModelProvider()` supports Chat Completions and Responses services; `anthropicModelProvider()` supports Anthropic Messages and optional system-prefix caching. Sandbox allocation is independent.

## How it works

Configure the endpoint, explicit credentials and request bounds, then pass the provider to `harness({ modelProvider, tools, instructions, limits })`. Compose that harness with `agent({ harness, model })`; the Outpost loop calls the model and runs its tools in the borrowed sandbox. Requests run in the Outpost process, propagate cancellation and account for reported usage once, including children and context summaries.

## Boundaries and responsibilities

The agent model is a nonempty name, optionally with `reasoning` and `maxOutputTokens` that the provider validates when the agent is composed. The service validates model availability when called; there is no local catalog, retry or protocol fallback. These transports translate tool calls but never execute them; results report a normalized stop reason instead of hiding truncation or refusals. Local HTTP fixtures validate the contracts without proving authenticated compatibility with every service.

## Entry points

- [openaiModelProvider](../../openaimodelprovider/)
- [anthropicModelProvider](../../anthropicmodelprovider/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)

[Learn with the practical guide](../../../guide/advanced/model-providers/).
