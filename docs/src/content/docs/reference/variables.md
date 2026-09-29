---
title: "Variables"
description: "Variables — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Variables } from "@elie-laloum/outpost";
```

## Purpose and behavior

Environment variables as name-to-value strings, used for Command.variables, sandbox variables and agent variables. An agent and its sandbox provider must not declare the same variable; the overlap fails with code configuration.

[Complete example and detailed rules](../../guide/environment-variables/).

## Signature

```ts
export type Variables = Readonly<Record<string, string>>;
```
