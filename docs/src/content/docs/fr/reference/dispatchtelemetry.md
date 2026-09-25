---
title: "DispatchTelemetry"
description: "DispatchTelemetry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchTelemetry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                             | Présence | Rôle                                                                               |
| --------------- | -------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `startDispatch` | `() => DispatchTelemetrySession` | Requis   | Ouvre une session indépendante pour un appel public de dispatch, avant validation. |

## Signature

```ts
export interface DispatchTelemetry {
  startDispatch(): DispatchTelemetrySession;
}
```

## Contrats associés

- [DispatchTelemetrySession](../dispatchtelemetrysession/)
