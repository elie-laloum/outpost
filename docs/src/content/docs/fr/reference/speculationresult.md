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

| Nom                | Type                                                                                                                                           | Présence  | Rôle                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `integration`      | `SpeculationIntegration \| undefined`                                                                                                          | Optionnel | Vérification de fusion récente sans mutation pour le gagnant, liée au commit candidat validé et au snapshot hôte courant.                                                        |
| `previousAttempts` | `readonly SpeculativeCandidateResult<T>[] \| undefined`                                                                                        | Optionnel | Tentatives antérieures interrompues conservées par une course durable reprise, avec branches et emplacements de récupération.                                                    |
| `id`               | `string`                                                                                                                                       | Requis    | Identifiant unique de cette course spéculative.                                                                                                                                  |
| `baseline`         | `string`                                                                                                                                       | Requis    | Commit Git utilisé comme état initial pour mesurer le nouveau travail.                                                                                                           |
| `host`             | `{ readonly before: SpeculativeHostSnapshot; readonly after?: SpeculativeHostSnapshot; readonly changed: boolean; readonly error?: unknown; }` | Requis    | Snapshots du checkout hôte avant et après la course, avec détection de changements et éventuelle erreur d’inspection.                                                            |
| `status`           | `"aborted" \| "quota" \| "winner" \| "no-winner" \| "budget-exhausted"`                                                                        | Requis    | Résultat de la course : winner, no-winner, quota lorsqu’aucun candidat n’a gagné et qu’au moins un s’est arrêté sur une limite d’usage ou de débit, aborted ou budget-exhausted. |
| `quota`            | `QuotaFault \| undefined`                                                                                                                      | Optionnel | Limite indiquée avec le statut quota : la réinitialisation connue la plus proche parmi les candidats arrêtés, ou la première limite si aucune n’est connue.                      |
| `winner`           | `SpeculativeCandidateResult<T> \| undefined`                                                                                                   | Optionnel | Candidat choisi ayant passé la validation et terminé le nettoyage, lorsqu’il existe.                                                                                             |
| `candidates`       | `readonly SpeculativeCandidateResult<T>[]`                                                                                                     | Requis    | Statut final, branche, travail conservé et sortie disponible de chaque candidat.                                                                                                 |
| `usage`            | `WorkflowUsage`                                                                                                                                | Requis    | Tentatives admises et usage de tokens observé cumulés, y compris la comptabilité restaurée.                                                                                      |
| `error`            | `unknown`                                                                                                                                      | Optionnel | Échec d’origine rencontré pendant l’exécution, la validation d’un candidat ou le nettoyage de la course.                                                                         |

## Signature

```ts
export interface SpeculationResult<T = undefined> {
  readonly integration?: SpeculationIntegration;
  readonly previousAttempts?: readonly SpeculativeCandidateResult<T>[];
  readonly id: string;
  readonly baseline: string;
  readonly host: {
    readonly before: SpeculativeHostSnapshot;
    readonly after?: SpeculativeHostSnapshot;
    readonly changed: boolean;
    readonly error?: unknown;
  };
  readonly status:
    "winner" | "no-winner" | "quota" | "aborted" | "budget-exhausted";
  /** Earliest known reset among candidates stopped by a usage or rate limit. */
  readonly quota?: QuotaFault;
  readonly winner?: SpeculativeCandidateResult<T>;
  readonly candidates: readonly SpeculativeCandidateResult<T>[];
  readonly usage: WorkflowUsage;
  readonly error?: unknown;
}
```

## Contrats associés

- [QuotaFault](../type-quotafault/)
- [SpeculationIntegration](../speculationintegration/)
- [SpeculativeCandidateResult](../speculativecandidateresult/)
- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
- [WorkflowUsage](../workflowusage/)
