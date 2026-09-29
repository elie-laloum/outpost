---
title: "RecoveryRetentionEntry"
description: "RecoveryRetentionEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionEntry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                     | Présence  | Rôle                                                                                                                                                        |
| ------------ | ---------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `revision`   | `string \| undefined`                    | Optionnel | Révision de transport de l’objet, ou de l’index d’un journal ; la suppression en dépend.                                                                    |
| `objects`    | `readonly TransportEntry[] \| undefined` | Optionnel | Objets versionnés supprimés avec l’entrée : l’index et les segments d’un journal, ou un objet de cache. Chacun n’est effacé qu’à sa révision enregistrée.   |
| `path`       | `string`                                 | Requis    | Chemin hôte d’une entrée de .outpost, ou clé d’objet pour les journaux, les entrées de cache et toute entrée d’un plan de transport.                        |
| `category`   | `string`                                 | Requis    | Catégorie de stockage, par exemple workspaces, logs, task-cache, recovery, locks ou checkpoints.                                                            |
| `bytes`      | `number`                                 | Requis    | Octets de l’entrée : taille des fichiers d’un dossier, ou de l’index et des segments d’un journal.                                                          |
| `eligible`   | `boolean`                                | Requis    | Indique si pruneRecoveryRetention() tentera de supprimer l’entrée ; true seulement quand reason vaut ELIGIBLE.                                              |
| `reason`     | `string`                                 | Requis    | ELIGIBLE ou le code qui conserve l’entrée, par exemple SCOPE_NOT_SELECTED, RETENTION_AGE, DIRTY_WORKSPACE, INCOMPLETE_INVENTORY ou RECOVERY_DATA_PROTECTED. |
| `branch`     | `string \| undefined`                    | Optionnel | Branche extraite dans un worktree enregistré ; le nettoyage l’exige inchangée et la conserve.                                                               |
| `head`       | `string \| undefined`                    | Optionnel | Commit HEAD d’un worktree enregistré ; le nettoyage l’exige inchangé.                                                                                       |
| `modifiedAt` | `string \| undefined`                    | Optionnel | Horodatage ISO de la dernière modification dans l’entrée, comparé à minAgeMs.                                                                               |

## Signature

```ts
export interface RecoveryRetentionEntry {
  readonly revision?: string;
  readonly objects?: readonly TransportEntry[];
  readonly path: string;
  readonly category: string;
  readonly bytes: number;
  readonly eligible: boolean;
  readonly reason: string;
  readonly branch?: string;
  readonly head?: string;
  readonly modifiedAt?: string;
}
```

## Contrats associés

- [TransportEntry](../transportentry/)
