---
title: "DiagnosticCapability"
description: "DiagnosticCapability — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DiagnosticCapability } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                                                    | Présence | Rôle                                                                                           |
| ------------ | ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `id`         | `"command" \| "transfers" \| "batchTransfers" \| "interactiveTerminal"` | Requis   | Capacité évaluée : commande, transferts, transferts par lot ou terminal interactif.            |
| `advertised` | `boolean \| "unknown"`                                                  | Requis   | Indique si l’adapter inspecté annonce cette capacité ; unknown si cela ne peut être déterminé. |
| `observed`   | `"fail" \| "unverified" \| "pass"`                                      | Requis   | Résultat de la sonde, ou unverified si aucune sonde n’a établi la prise en charge.             |

## Signature

```ts
export interface DiagnosticCapability {
  readonly id:
    "command" | "transfers" | "batchTransfers" | "interactiveTerminal";
  readonly advertised: boolean | "unknown";
  readonly observed: "pass" | "fail" | "unverified";
}
```
