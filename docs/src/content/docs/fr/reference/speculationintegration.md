---
title: "SpeculationIntegration"
description: "SpeculationIntegration — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Fait partie de l’API expérimentale de spéculation : ce contrat peut encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationIntegration } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                 | Présence  | Rôle                                                                                                                                                                                        |
| ----------------- | ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`          | `"conflict" \| "clean" \| "blocked"` | Requis    | clean si les commits se fusionnent sans conflit, conflict avec les chemins dans conflicts, blocked avec une reason. Rien n’est fusionné.                                                    |
| `host`            | `SpeculativeHostSnapshot`            | Requis    | Snapshot hôte pris au début de la vérification ; son head est le commit vérifié.                                                                                                            |
| `candidateCommit` | `string \| undefined`                | Optionnel | Commit candidat vérifié contre host.head ; absent si la vérification est bloquée.                                                                                                           |
| `conflicts`       | `readonly string[]`                  | Requis    | Chemins en conflit signalés par git merge-tree ; vide sauf si le statut est conflict.                                                                                                       |
| `reason`          | `string \| undefined`                | Optionnel | Raison du blocage : changements non commités, HEAD détaché, branche déplacée, dépôt modifié pendant la vérification, ou échec de Git, par exemple une version sans merge-tree --write-tree. |

## Signature

```ts
export interface SpeculationIntegration {
  readonly status: "clean" | "conflict" | "blocked";
  readonly host: SpeculativeHostSnapshot;
  readonly candidateCommit?: string;
  readonly conflicts: readonly string[];
  readonly reason?: string;
}
```

## Contrats associés

- [SpeculativeHostSnapshot](../speculativehostsnapshot/)
