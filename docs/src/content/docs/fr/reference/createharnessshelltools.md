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

Crée le jeu d’outils shell : shell exécute sh -c à la racine du dépôt avec un délai et sans entrée, et renvoie statut de sortie, stdout et stderr. Exige un shell POSIX dans le sandbox.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Paramètres et propriétés

| Nom                  | Type                             | Présence  | Rôle                                                                                                                   |
| -------------------- | -------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `options`            | `ShellToolsOptions \| undefined` | Optionnel | Réglages optionnels du shell, comme le délai des commandes.                                                            |
| `options.deadlineMs` | `number \| undefined`            | Optionnel | Délai de chaque commande shell en millisecondes ; 120 000 par défaut. Le délai des outils du harness s’applique aussi. |

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
