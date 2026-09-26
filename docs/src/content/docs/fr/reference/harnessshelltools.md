---
title: "harnessShellTools"
description: "harnessShellTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import { harnessShellTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils shell : shell exécute sh -c à la racine du dépôt avec un délai et sans entrée, et renvoie statut de sortie, stdout et stderr. Exige un shell POSIX dans le sandbox.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                  | Type                             | Présence  | Rôle                                                                                                                   |
| -------------------- | -------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `options`            | `ShellToolsOptions \| undefined` | Optionnel | Réglages optionnels du shell, comme le délai des commandes.                                                            |
| `options.deadlineMs` | `number \| undefined`            | Optionnel | Délai de chaque commande shell en millisecondes ; 120 000 par défaut. Le délai des outils du harness s’applique aussi. |

## Retour

`HarnessToolset`

## Signature

```ts
export declare function harnessShellTools(
  options?: ShellToolsOptions,
): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
- [ShellToolsOptions](../shelltoolsoptions/)
