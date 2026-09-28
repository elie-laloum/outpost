---
title: "replayAgent"
description: "replayAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { replayAgent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un agent à usage unique qui rejoue le journal d’un dispatch sans appeler de modèle. Chaque tour vérifie le prompt rendu et réémet les événements et l’usage enregistrés ; le dernier tour de chaque dispatch en sandbox reconstruit les commits enregistrés dans la sandbox avec leurs identités d’origine, si bien qu’une baseline identique donne des identifiants de commit identiques. Les divergences lèvent ReplayDivergence ou, avec divergence: "warn", des avertissements. Un rejeu ne peut être ni repris ni forké.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom                  | Type                                  | Présence  | Rôle                                                                                                                                                                                      |
| -------------------- | ------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `ReplayAgentOptions`                  | Requis    | Journal à rejouer et politique de divergence.                                                                                                                                             |
| `options.journal`    | `readonly unknown[]`                  | Requis    | Entrées renvoyées par readJournal pour un dispatch. Enregistrez avec logging.replayable pour inclure les commits du workspace.                                                            |
| `options.divergence` | `ReplayDivergencePolicy \| undefined` | Optionnel | Politique de divergence ; fail par défaut. warn continue après un écart de prompt, de baseline ou d’arbre mais échoue toujours si un patch ne s’applique pas ou si le journal est épuisé. |

## Retour

`ReplayAgent`

## Signature

```ts
export declare function replayAgent(options: ReplayAgentOptions): ReplayAgent;
```

## Contrats associés

- [ReplayAgent](../type-replayagent/)
- [ReplayAgentOptions](../replayagentoptions/)
