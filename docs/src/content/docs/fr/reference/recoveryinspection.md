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

| Nom              | Type                                  | Présence  | Rôle                                                                                                                                                             |
| ---------------- | ------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository`     | `string`                              | Requis    | Dépôt local canonique pour l’inspection du système de fichiers ; libellé optionnel de l’appelant ou chaîne vide en mode transport.                               |
| `activity`       | `"unverified"`                        | Requis    | Toujours unverified : l’inventaire de fichiers seul ne prouve pas l’inactivité des ressources conservées.                                                        |
| `git`            | `WorkspaceGitInspection \| undefined` | Optionnel | Rapport d’état Git des worktrees, présent lorsque l’inspection Git a été demandée.                                                                               |
| `locks`          | `LockInspection \| undefined`         | Optionnel | Rapport de possession locale des verrous, présent lorsque leur inspection a été demandée.                                                                        |
| `resources`      | `ResourceInspection \| undefined`     | Optionnel | Rapport d’activité des sandboxes sur demande ; la propriété des enregistrements distants reste toujours non vérifiée.                                            |
| `root`           | `string`                              | Requis    | Racine locale inspectée, ou marqueur logique transport pour un inventaire objet.                                                                                 |
| `categories`     | `readonly StorageCategory[]`          | Requis    | Récupération, journaux, verrous et workspaces locaux, ou artefacts, checkpoints, conversations, récupération, journaux, réservations et ressources du transport. |
| `usage`          | `Readonly<StorageUsage>`              | Requis    | Octets de stockage observés et nombres de fichiers, dossiers, liens symboliques et autres entrées.                                                               |
| `issues`         | `readonly StorageIssue[]`             | Requis    | Problèmes de fichiers, Git ou possession ayant empêché une inspection complète.                                                                                  |
| `complete`       | `boolean`                             | Requis    | Indique si toute l’inspection demandée s’est terminée sans limite de parcours ni entrée inaccessible.                                                            |
| `scannedEntries` | `number`                              | Requis    | Nombre d’entrées de fichiers visitées dans la limite d’inspection.                                                                                               |
| `maxEntries`     | `number`                              | Requis    | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                                                        |

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
