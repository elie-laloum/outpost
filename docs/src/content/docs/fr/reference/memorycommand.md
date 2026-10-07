---
title: "MemoryCommand"
description: "MemoryCommand — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MemoryCommand } from "@elie-laloum/outpost/testing";
```

## Paramètres et propriétés

| Nom          | Type                             | Présence  | Rôle                                                                                                                             |
| ------------ | -------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `executable` | `string`                         | Requis    | Nom d’exécutable attendu pour la prochaine commande hors agent. Il est comparé littéralement et n’est jamais lancé.              |
| `arguments`  | `readonly string[] \| undefined` | Optionnel | Arguments exacts ordonnés attendus pour cette commande ; tableau vide par défaut.                                                |
| `status`     | `number \| undefined`            | Optionnel | Statut de sortie simulé ; 0 par défaut. Une valeur non nulle fait échouer defineCommandTask selon sa politique normale de retry. |
| `stdout`     | `string \| undefined`            | Optionnel | Sortie standard simulée transmise à l’observation de commande et renvoyée dans CommandResult ; vide par défaut.                  |
| `stderr`     | `string \| undefined`            | Optionnel | Erreur standard simulée transmise à l’observation de commande et renvoyée dans CommandResult ; vide par défaut.                  |

## Signature

```ts
export interface MemoryCommand extends Partial<CommandResult> {
  readonly executable: string;
  readonly arguments?: readonly string[];
}
```

## Contrats associés

- [CommandResult](../commandresult/)
