---
title: "AttachResult"
description: "AttachResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AttachResult**. Consultez le [guide commandes et terminal](../../guide/environment/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AttachResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter un processus ou attacher une session interactive native avec possession explicite des flux.

Command renvoie les statuts non nuls ; l’appelant doit les vérifier. Attach exige un provider interactif compatible. Vercel rejette l’attachement.

[Exemple complet et règles détaillées](../../guide/environment/commands/).

## Paramètres et propriétés

| Nom                 | Type                  | Présence  | Rôle                                                                           |
| ------------------- | --------------------- | --------- | ------------------------------------------------------------------------------ |
| `commits`           | `readonly Commit[]`   | Requis    | Identités et sujets des commits Git collectés.                                 |
| `branch`            | `string`              | Requis    | Politique de workspace Git ou identité de branche résultante selon ce contrat. |
| `directory`         | `string`              | Requis    | Dossier utilisé par l’opération ; voir les règles de résolution.               |
| `status`            | `number`              | Requis    | Résultat enregistré du processus ou cycle de vie ; voir son type.              |
| `stdout`            | `string`              | Requis    | Sortie standard capturée.                                                      |
| `stderr`            | `string`              | Requis    | Sortie d’erreur capturée.                                                      |
| `retainedDirectory` | `string \| undefined` | Optionnel | Workspace conservé pour inspection ou récupération.                            |

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
