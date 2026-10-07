---
title: "ConflictResolution"
description: "ConflictResolution — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConflictResolution } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                                                                                                                                                      |
| -------------- | --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commit`       | `string`              | Requis    | Commit exact de résolution vérifié, comparé au HEAD du workspace de résolution et devant contenir les deux commits d’entrée figés avant intégration en avance rapide.                                     |
| `branch`       | `string`              | Requis    | Nom de la branche dédiée à la résolution. Doit correspondre au workspace fourni ; reste disponible pour revue après réussite ou échec.                                                                    |
| `directory`    | `string`              | Requis    | Dossier hôte du worktree dédié à la résolution. Doit correspondre au workspace fourni ; les worktrees propres après réussite peuvent être supprimés, tandis que les résolutions échouées sont conservées. |
| `usage`        | `Usage`               | Requis    | Usage de tokens du dispatch de résolution, incluant les tentatives de repli explicites. Renvoyé séparément de l’usage de la tâche initiale ; l’appelant doit l’ajouter à sa comptabilité de workflow.     |
| `verification` | `CommandResult`       | Requis    | Résultat réel de la commande de vérification. Un statut non nul refuse l’intégration ; la stratégie intégrée exige aussi que le commit vérifié et les fichiers non ignorés restent inchangés.             |
| `transcript`   | `string \| undefined` | Optionnel | Chemin du transcript capturé lors du dispatch de résolution lorsque l’agent prend en charge et active la capture de conversation.                                                                         |

## Signature

```ts
export interface ConflictResolution {
  readonly commit: string;
  readonly branch: string;
  readonly directory: string;
  readonly usage: Usage;
  readonly verification: CommandResult;
  readonly transcript?: string;
}
```

## Contrats associés

- [CommandResult](../commandresult/)
- [Usage](../usage/)
