---
title: "RecoveryInspection"
description: "RecoveryInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryInspection } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                  | Présence  | Rôle                                                                                                                                                                                                                 |
| ---------------- | ------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`                              | Requis    | Racine du checkout Git inspecté en mode local. En mode transport, l’option repository renvoyée telle quelle, ou une chaîne vide.                                                                                     |
| `activity`       | `"unverified"`                        | Requis    | Toujours unverified : ni les fichiers ni les objets d’un transport ne prouvent que les ressources conservées sont inactives.                                                                                         |
| `git`            | `WorkspaceGitInspection \| undefined` | Optionnel | Rapport d’état Git des worktrees, présent lorsque l’inspection Git a été demandée.                                                                                                                                   |
| `locks`          | `LockInspection \| undefined`         | Optionnel | Rapport de possession locale des verrous, présent lorsque leur inspection a été demandée.                                                                                                                            |
| `resources`      | `ResourceInspection \| undefined`     | Optionnel | Activité des sandboxes enregistrée, présente quand resources vaut true. La possession est jugée par rapport au processus courant en mode local et reste toujours unknown en mode transport.                          |
| `root`           | `string`                              | Requis    | Dossier inspecté, le .outpost du dépôt, ou transport pour un inventaire de transport.                                                                                                                                |
| `categories`     | `readonly StorageCategory[]`          | Requis    | Un groupe par catégorie, présent même vide : recovery, logs, locks, workspaces et storage en local ; artifacts, checkpoints, conversations, recovery, logs, reservations, resources et task-cache pour un transport. |
| `usage`          | `Readonly<StorageUsage>`              | Requis    | Octets de stockage observés et nombres de fichiers, dossiers, liens symboliques et autres entrées.                                                                                                                   |
| `issues`         | `readonly StorageIssue[]`             | Requis    | Entrées qui n’ont pas pu être entièrement inspectées, chacune avec un code tel que ENTRY_LIMIT, DEPTH_LIMIT, UNSUPPORTED_TYPE ou un code d’erreur du système de fichiers.                                            |
| `complete`       | `boolean`                             | Requis    | true lorsque le parcours n’a relevé aucun problème.                                                                                                                                                                  |
| `scannedEntries` | `number`                              | Requis    | Entrées visitées, au plus maxEntries : entrées du système de fichiers en local, objets listés pour un transport.                                                                                                     |
| `maxEntries`     | `number`                              | Requis    | Limite du parcours, 100000 par défaut. L’atteindre ajoute un problème ENTRY_LIMIT et rend l’inventaire incomplet.                                                                                                    |

## Signature

```ts
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
  readonly resources?: ResourceInspection;
}
```

## Contrats associés

- [LockInspection](../support-lockinspection/)
- [ResourceInspection](../resourceinspection/)
- [StorageInventory](../support-storageinventory/)
- [WorkspaceGitInspection](../support-workspacegitinspection/)
