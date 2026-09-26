---
title: "Model providers — Overview"
description: "A model provider supplies the request transport used by a custom harness."
sidebar:
  label: Overview
  order: 0
---

:::caution[Experimental — unreleased refactor]
Bounded requests with messages, tool calls, reasoning replay, history caching and streaming are implemented. The built-in engine of `harness()` drives them.
:::

A model provider supplies the request transport used by a custom harness. `openaiModelProvider()` supports Chat Completions and Responses services; `anthropicModelProvider()` supports Anthropic Messages and optional system-prefix caching. Sandbox allocation is independent.

## How it works

Configure the endpoint, explicit credentials and request bounds, then pass the provider to `harness({ modelProvider, run })`. The callback uses `context.modelProvider.request()` with the agent's model. Requests run in the Outpost process and inherit cancellation; reported usage is accumulated once per call.

## Boundaries and responsibilities

The agent model is a nonempty name, optionally with `reasoning` and `maxOutputTokens` that the provider validates when the agent is composed. The service validates model availability when called; there is no local catalog, retry or protocol fallback. These transports translate tool calls but never execute them; results report a normalized stop reason instead of hiding truncation or refusals. Local HTTP fixtures validate the contracts without proving authenticated compatibility with every service.

## Entry points

- [openaiModelProvider](../../openaimodelprovider/)
- [anthropicModelProvider](../../anthropicmodelprovider/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)

[Learn with the practical guide](../../../guide/advanced/model-providers/).
