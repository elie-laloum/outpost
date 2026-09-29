---
title: "createHarnessShellTools"
description: "createHarnessShellTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessShellTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils shell : shell exécute sh -c à la racine du dépôt, sans entrée et avec un délai de 120000 ms par défaut, puis renvoie le statut de sortie, stdout et stderr ; un statut non nul donne un résultat en erreur. Il déclare la commande pour les règles de permission et exige un shell POSIX dans la sandbox.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Paramètres et propriétés

| Nom                  | Type                             | Présence  | Rôle                                                                                                                   |
| -------------------- | -------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `options`            | `ShellToolsOptions \| undefined` | Optionnel | Réglages du shell : le délai de chaque commande.                                                                       |
| `options.deadlineMs` | `number \| undefined`            | Optionnel | Délai de chaque commande shell, 120000 par défaut (2 minutes). toolExecution.deadlineMs borne toujours l’appel entier. |

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessShellTools(
  options?: ShellToolsOptions,
): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
- [ShellToolsOptions](../shelltoolsoptions/)
