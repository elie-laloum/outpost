---
title: "DiagnosticCapability"
description: "DiagnosticCapability — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DiagnosticCapability**. Consultez le [guide diagnostics](../../guide/operations/doctor/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DiagnosticCapability } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter les prérequis hôtes, une sandbox possédée ou les fixtures de protocole. Les diagnostics sont des observations ; ils ne prouvent pas l’accès au compte ou au modèle.

Les contrôles distinguent capacités absentes, en échec et non prises en charge. Le diagnostic de sandbox utilise son verrou d’opération et ne devient pas propriétaire de sa fermeture.

[Exemple complet et règles détaillées](../../guide/operations/doctor/).

## Paramètres et propriétés

| Nom          | Type                                                                    | Présence | Rôle                                                                             |
| ------------ | ----------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `id`         | `"command" \| "transfers" \| "batchTransfers" \| "interactiveTerminal"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `advertised` | `boolean \| "unknown"`                                                  | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `observed`   | `"unverified" \| "pass" \| "fail"`                                      | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface DiagnosticCapability {
  readonly id:
    "command" | "transfers" | "batchTransfers" | "interactiveTerminal";
  readonly advertised: boolean | "unknown";
  readonly observed: "pass" | "fail" | "unverified";
}
```
