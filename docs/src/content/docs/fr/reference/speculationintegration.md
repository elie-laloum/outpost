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

| Nom               | Type                                 | Présence  | Rôle                                                                                                                                                                                                               |
| ----------------- | ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `status`          | `"conflict" \| "clean" \| "blocked"` | Requis    | clean indique une fusion sans conflit des commits enregistrés ; conflict liste les fichiers en conflit ; blocked signale un état sale/détaché ou changeant et les erreurs Git. Aucune intégration n’est effectuée. |
| `host`            | `SpeculativeHostSnapshot`            | Requis    | Snapshot hôte utilisé pour cette vérification ; la relancer si l’état hôte change avant l’intégration.                                                                                                             |
| `candidateCommit` | `string \| undefined`                | Optionnel | Commit exact du candidat vérifié contre host.head lorsque la vérification aboutit.                                                                                                                                 |
| `conflicts`       | `readonly string[]`                  | Requis    | Chemins signalés par Git merge-tree lors d’un conflit ; vide pour les vérifications clean ou blocked.                                                                                                              |
| `reason`          | `string \| undefined`                | Optionnel | Explication d’une vérification bloquée, notamment une référence candidate modifiée ou un support Git indisponible.                                                                                                 |

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
