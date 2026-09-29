---
title: "AttachResult"
description: "AttachResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AttachResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                  | Présence  | Rôle                                                                                                                                                                                                                            |
| ------------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commits`           | `readonly Commit[]`   | Requis    | Commits créés pendant la session, du plus récent au plus ancien, avec oid et sujet.                                                                                                                                             |
| `branch`            | `string`              | Requis    | Branche de travail de la session.                                                                                                                                                                                               |
| `directory`         | `string`              | Requis    | Répertoire du worktree de la session sur l’hôte.                                                                                                                                                                                |
| `status`            | `number`              | Requis    | Code de sortie du processus, 0 en cas de succès. Un code non nul résout quand même la commande : vérifiez-le.                                                                                                                   |
| `stdout`            | `string`              | Requis    | Derniers caractères de la sortie standard, dans la limite de retain. Vide quand une commande interactive sans flux de terminal utilisait le terminal de l’hôte avec le provider local, Docker ou Podman.                        |
| `stderr`            | `string`              | Requis    | Derniers caractères de la sortie d’erreur, dans la limite de retain. Vide dans le même cas de terminal hôte, et pour un terminal Daytona, dont toute la sortie est dans stdout.                                                 |
| `retainedDirectory` | `string \| undefined` | Optionnel | Worktree conservé à la fermeture : renseigné quand preserve a été demandé, ou quand il a un HEAD détaché ou des fichiers modifiés, non suivis ou ignorés. Absent quand le worktree a été supprimé, et toujours en mode current. |

## Signature

```ts
export interface AttachResult extends CommandResult, Disposal {
  readonly commits: readonly Commit[];
  readonly branch: string;
  readonly directory: string;
}
```

## Contrats associés

- [CommandResult](../commandresult/)
- [Commit](../commit/)
- [Disposal](../disposal/)
