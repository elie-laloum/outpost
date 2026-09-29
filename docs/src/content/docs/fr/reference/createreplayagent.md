---
title: "createReplayAgent"
description: "createReplayAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createReplayAgent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un agent à usage unique qui rejoue le journal d’un dispatch sans appeler de modèle. Chaque tour compare le prompt rendu, réémet les événements et l’usage enregistrés, et le dernier tour de chaque dispatch en sandbox reconstruit les commits enregistrés avec leurs identités d’origine. Une divergence lève ReplayDivergence (un avertissement pour certains types avec divergence: "warn") ; un journal mal formé lève le code configuration, et un agent de rejeu n’accepte pas le steering.

[Exemple complet et règles détaillées](../../guide/record-replay/).

## Paramètres et propriétés

| Nom                  | Type                                  | Présence  | Rôle                                                                                                                                                                                                             |
| -------------------- | ------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `ReplayAgentOptions`                  | Requis    | Journal à rejouer et politique de divergence.                                                                                                                                                                    |
| `options.journal`    | `readonly unknown[]`                  | Requis    | Entrées renvoyées par readJournal pour un dispatch. Enregistrez avec logging.replayable pour inclure les commits du workspace.                                                                                   |
| `options.divergence` | `ReplayDivergencePolicy \| undefined` | Optionnel | Politique de divergence, fail par défaut. warn continue après les divergences prompt, baseline, tree et unrecorded, mais lève toujours une erreur quand un patch ne s’applique pas ou que le journal est épuisé. |

## Retour

`ReplayAgent`

## Signature

```ts
export declare function createReplayAgent(
  options: ReplayAgentOptions,
): ReplayAgent;
```

## Contrats associés

- [ReplayAgent](../type-replayagent/)
- [ReplayAgentOptions](../replayagentoptions/)
