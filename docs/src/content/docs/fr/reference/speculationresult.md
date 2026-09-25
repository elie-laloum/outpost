---
title: "SpeculationResult"
description: "SpeculationResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculationResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                                                                                                                           | Présence  | Rôle                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                       | Requis    | Identifiant unique de cette course spéculative.                                                                       |
| `baseline`   | `string`                                                                                                                                       | Requis    | Commit Git utilisé comme état initial pour mesurer le nouveau travail.                                                |
| `host`       | `{ readonly before: SpeculativeHostSnapshot; readonly after?: SpeculativeHostSnapshot; readonly changed: boolean; readonly error?: unknown; }` | Requis    | Snapshots du checkout hôte avant et après la course, avec détection de changements et éventuelle erreur d’inspection. |
| `status`     | `"aborted" \| "winner" \| "no-winner" \| "budget-exhausted"`                                                                                   | Requis    | Résultat de la course : winner, no-winner, aborted ou budget-exhausted.                                               |
| `winner`     | `SpeculativeCandidateResult<T> \| undefined`                                                                                                   | Optionnel | Candidat choisi ayant passé la validation et terminé le nettoyage, lorsqu’il existe.                                  |
| `candidates` | `readonly SpeculativeCandidateResult<T>[]`                                                                                                     | Requis    | Statut final, branche, travail conservé et sortie disponible de chaque candidat.                                      |
| `usage`      | `WorkflowUsage`                                                                                                                                | Requis    | Tentatives admises et usage de tokens observé cumulés, y compris la comptabilité restaurée.                           |
| `error`      | `unknown`                                                                                                                                      | Optionnel | Échec d’origine rencontré pendant l’exécution, la validation d’un candidat ou le nettoyage de la course.              |

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
