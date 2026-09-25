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

| Nom                 | Type                  | Présence  | Rôle                                                                   |
| ------------------- | --------------------- | --------- | ---------------------------------------------------------------------- |
| `commits`           | `readonly Commit[]`   | Requis    | Identités et sujets des commits Git collectés.                         |
| `branch`            | `string`              | Requis    | Nom de la branche de travail utilisée ou observée pendant l’exécution. |
| `directory`         | `string`              | Requis    | Dossier hôte du workspace utilisé pour cette exécution.                |
| `status`            | `number`              | Requis    | Code de sortie du processus ; zéro indique le succès.                  |
| `stdout`            | `string`              | Requis    | Sortie standard capturée.                                              |
| `stderr`            | `string`              | Requis    | Sortie d’erreur capturée.                                              |
| `retainedDirectory` | `string \| undefined` | Optionnel | Workspace conservé pour inspection ou récupération.                    |

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
