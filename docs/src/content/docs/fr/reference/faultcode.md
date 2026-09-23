---
title: "FaultCode"
description: "FaultCode — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FaultCode**. Consultez le [guide erreurs](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

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
