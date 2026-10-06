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

JSON Schema object describing harness tool inputs or JSON response inputs. Tools require an object input and enforce their supported keyword subset; response instructions also accept schemas describing arrays, primitives and unions.

[Complete example and detailed rules](../../guide/harness-tools/).

## Signature

```ts
export type JsonSchema = Readonly<Record<string, unknown>>;
```
