---
title: "JsonSchema"
description: "JsonSchema — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { JsonSchema } from "@elie-laloum/outpost";
```

## Purpose and behavior

JSON Schema object describing a harness tool's input when no Standard Schema is given, and the form HarnessTool.inputSchema exposes to the model. The root must describe an object, otherwise tool definition fails with code configuration.

[Complete example and detailed rules](../../guide/harness-tools/).

## Signature

```ts
export type JsonSchema = Readonly<Record<string, unknown>>;
```
