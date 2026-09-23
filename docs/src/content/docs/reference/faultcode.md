---
title: "FaultCode"
description: "FaultCode — Outpost API"
sidebar:
  order: 10
---

Public contract for **FaultCode**. See the [errors guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { FaultCode } from "@elie-laloum/outpost";
```

## Signature

```ts
export type FaultCode =
  | "configuration"
  | "process"
  | "timeout"
  | "aborted"
  | "workspace"
  | "conflict"
  | "prompt"
  | "response"
  | "session"
  | "provider";
```
