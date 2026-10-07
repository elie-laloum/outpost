---
title: "SpeculationResult"
description: "SpeculationResult — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Fait partie de l’API expérimentale de spéculation : ce contrat peut encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                                                                                                                           | Présence  | Rôle                                                                                                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `integration`      | `SpeculationIntegration \| undefined`                                                                                                          | Optionnel | Vérification de fusion du commit validé du gagnant contre le HEAD hôte à la fin de la course ; absente sans gagnant.                                                                                                                                  |
| `previousAttempts` | `readonly SpeculativeCandidateResult<T>[] \| undefined`                                                                                        | Optionnel | Courses durables uniquement : tentatives antérieures remplacées par un rejeu après un plantage ou un arrêt de quota, avec leurs branches et worktrees conservés.                                                                                      |
| `id`               | `string`                                                                                                                                       | Requis    | Identifiant de la course utilisé dans les noms des branches candidates ; une course durable le conserve d’un appel à l’autre.                                                                                                                         |
| `baseline`         | `string`                                                                                                                                       | Requis    | Commit HEAD de l’hôte au premier démarrage de la course ; chaque branche candidate part de ce commit.                                                                                                                                                 |
| `host`             | `{ readonly before: SpeculativeHostSnapshot; readonly after?: SpeculativeHostSnapshot; readonly changed: boolean; readonly error?: unknown; }` | Requis    | Snapshots du checkout hôte avant la course et à sa fin. changed vaut true si le HEAD, la branche, l’état sale ou le contenu ont changé, ou si le snapshot final a échoué avec error.                                                                  |
| `status`           | `"aborted" \| "quota" \| "winner" \| "no-winner" \| "budget-exhausted"`                                                                        | Requis    | winner ; aborted si votre signal a annulé la course ; budget-exhausted ; quota si aucun candidat n’a gagné et qu’une limite d’usage ou de débit en a arrêté au moins un ; sinon no-winner. Une course durable terminée renvoie son statut enregistré. |
| `quota`            | `QuotaFault \| undefined`                                                                                                                      | Optionnel | Limite indiquée avec le statut quota : la réinitialisation connue la plus proche parmi les candidats arrêtés, ou la première limite si aucune n’est connue.                                                                                           |
| `winner`           | `SpeculativeCandidateResult<T> \| undefined`                                                                                                   | Optionnel | Candidat accepté dont la sandbox s’est fermée sans erreur : le premier en mode first, ou le candidat admis au score le plus élevé en mode best. Les scores égaux suivent l’ordre de déclaration ; absent si aucun candidat ne peut être sélectionné.  |
| `candidates`       | `readonly SpeculativeCandidateResult<T>[]`                                                                                                     | Requis    | Dernière tentative de chaque candidat, dans l’ordre de options.candidates.                                                                                                                                                                            |
| `usage`            | `WorkflowUsage`                                                                                                                                | Requis    | Tentatives admises et tokens rapportés par les dispatchs des candidats, cumulés sur les appels d’une course durable.                                                                                                                                  |
| `error`            | `unknown`                                                                                                                                      | Optionnel | Erreur de budget qui a arrêté la course, par exemple une limite épuisée ou un usage de tokens incomplet ; une course durable restaurée donne son message enregistré. Les échecs des candidats figurent sur chaque candidat.                           |

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
