---
title: "ConversationFormat"
description: "ConversationFormat — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ConversationFormat } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persisted name of a native conversation format, recorded in each ConversationLocation and in transport keys, bundles and records. Built-in names are "claude", "codex", "copilot", "kimi" and "harness" (built-in Outpost harness); a stored name must not change.

[Complete example and detailed rules](../../guide/conversations/).

## Signature

```ts
export type ConversationFormat = string;
```
