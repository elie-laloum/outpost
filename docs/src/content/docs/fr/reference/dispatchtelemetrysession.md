---
title: "DispatchTelemetrySession"
description: "DispatchTelemetrySession — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchTelemetrySession } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                                          | Présence | Rôle                                                                                         |
| -------- | --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `finish` | `(outcome: DispatchTelemetryOutcome) => void` | Requis   | Termine cette session avec le résultat définitif du dispatch et les totaux de tokens connus. |

## Signature

```ts
export interface DispatchTelemetrySession {
  finish(outcome: DispatchTelemetryOutcome): void;
}
```

## Contrats associés

- [DispatchTelemetryOutcome](../dispatchtelemetryoutcome/)
