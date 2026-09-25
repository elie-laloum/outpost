---
title: "SpeculationResult"
description: "SpeculationResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculationResult**. Consultez le [guide exécution spéculative](../../guide/advanced/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculationResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Mettre en concurrence des branches candidates bornées et retenir la première validée après nettoyage.

Prototype de recherche : au plus huit candidats, concurrence de deux par défaut. Aucune intégration, aucun push ni reprise durable de la course automatiques. L’usage observé ne plafonne pas la facturation.

[Exemple complet et règles détaillées](../../guide/advanced/speculation/).

## Paramètres et propriétés

| Nom          | Type                                                                                                                                           | Présence  | Rôle                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `baseline`   | `string`                                                                                                                                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `host`       | `{ readonly before: SpeculativeHostSnapshot; readonly after?: SpeculativeHostSnapshot; readonly changed: boolean; readonly error?: unknown; }` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `status`     | `"aborted" \| "winner" \| "no-winner" \| "budget-exhausted"`                                                                                   | Requis    | Résultat enregistré du processus ou cycle de vie ; voir son type.                |
| `winner`     | `SpeculativeCandidateResult<T> \| undefined`                                                                                                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `candidates` | `readonly SpeculativeCandidateResult<T>[]`                                                                                                     | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `usage`      | `WorkflowUsage`                                                                                                                                | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `error`      | `unknown`                                                                                                                                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface SpeculationResult<T = undefined> {
  readonly id: string;
  readonly baseline: string;
  readonly host: {
    readonly before: SpeculativeHostSnapshot;
    readonly after?: SpeculativeHostSnapshot;
    readonly changed: boolean;
    readonly error?: unknown;
  };
  readonly status: "winner" | "no-winner" | "aborted" | "budget-exhausted";
  readonly winner?: SpeculativeCandidateResult<T>;
  readonly candidates: readonly SpeculativeCandidateResult<T>[];
  readonly usage: WorkflowUsage;
  readonly error?: unknown;
}
```

## Contrats associés

- [SpeculativeCandidateResult](../speculativecandidateresult/)
- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
- [WorkflowUsage](../workflowusage/)
