---
title: "ConflictContext"
description: "ConflictContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConflictContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                          | Présence  | Rôle                                                                                                                                                                                                                         |
| ----------------- | ----------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspace`       | `Workspace`                   | Requis    | Workspace nommé séparé, possédé par le moteur d’intégration et démarrant à candidateCommit. La stratégie peut y allouer une sandbox, doit la fermer avant son retour et ne doit ni intégrer ni fermer le workspace lui-même. |
| `hostCommit`      | `string`                      | Requis    | Commit hôte exact à fusionner dans le workspace de résolution ; l’intégration finale est refusée si la branche ou le commit hôte change.                                                                                     |
| `candidateCommit` | `string`                      | Requis    | Commit exact de la branche source capturé au précontrôle et utilisé pour ouvrir le workspace de résolution. L’intégration finale exige qu’il reste inchangé et soit un ancêtre de la résolution.                             |
| `conflicts`       | `readonly string[]`           | Requis    | Chemins relatifs au dépôt signalés en conflit par Git merge-tree ; les entrées réellement non fusionnées sont préparées dans la sandbox choisie.                                                                             |
| `signal`          | `AbortSignal`                 | Requis    | Signal combinant l’appelant de l’intégration et le délai total. La stratégie doit le transmettre à sa sandbox, à l’agent et à la vérification.                                                                               |
| `observation`     | `ObservationHub \| undefined` | Optionnel | Hub d’observation du workspace hérité par la résolution ; le transmettre explicitement aux opérations de sandbox et au dispatch de l’agent.                                                                                  |

## Signature

```ts
export interface ConflictContext {
  readonly workspace: Workspace;
  readonly hostCommit: string;
  readonly candidateCommit: string;
  readonly conflicts: readonly string[];
  readonly signal: AbortSignal;
  readonly observation?: ObservationHub;
}
```

## Contrats associés

- [ObservationHub](../observationhub/)
- [Workspace](../workspace/)
