---
title: "DispatchTelemetryOutcome"
description: "DispatchTelemetryOutcome — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchTelemetryOutcome } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                | Présence  | Rôle                                                                                                                               |
| ----------- | ----------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `status`    | `"done" \| "failed" \| "cancelled"` | Requis    | done quand le dispatch se résout, cancelled pour une annulation explicite, failed pour les autres rejets dont les délais dépassés. |
| `usage`     | `Usage`                             | Requis    | Totaux du résultat en cas de succès, consommation connue réconciliée en cas d’échec.                                               |
| `completed` | `boolean \| undefined`              | Optionnel | Indique si le dispatch réussi a satisfait sa condition de complétion ; absent en cas de rejet.                                     |

## Signature

```ts
export interface DispatchTelemetryOutcome {
  readonly status: "done" | "failed" | "cancelled";
  readonly usage: Usage;
  readonly completed?: boolean;
}
```

## Contrats associés

- [Usage](../usage/)
