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

| Nom          | Type                                                                    | Présence | Rôle                                                                                                                                                                                               |
| ------------ | ----------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | `"command" \| "transfers" \| "batchTransfers" \| "interactiveTerminal"` | Requis   | Capacité évaluée : command, transfers, batchTransfers ou interactiveTerminal.                                                                                                                      |
| `advertised` | `boolean \| "unknown"`                                                  | Requis   | Indique si le contrat de la ressource fournit la capacité : toujours true pour command et transfers, true pour batchTransfers quand le lease a fileTransfers, et unknown pour interactiveTerminal. |
| `observed`   | `"fail" \| "unverified" \| "pass"`                                      | Requis   | pass ou fail d’après le contrôle sandbox.command ou sandbox.transfers, unverified si cette sonde ne s’est pas exécutée. batchTransfers et interactiveTerminal restent toujours unverified.         |

## Signature

```ts
export interface DiagnosticCapability {
  readonly id:
    "command" | "transfers" | "batchTransfers" | "interactiveTerminal";
  readonly advertised: boolean | "unknown";
  readonly observed: "pass" | "fail" | "unverified";
}
```
