---
title: "createAgent"
description: "createAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAgent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Compose un harness et un modèle en un agent figé, sans lancer de processus ni de requête réseau. Un niveau de raisonnement ou un maxOutputTokens que le harness ne sait pas appliquer lève aussitôt le code configuration. Sans modèle, un harness CLI garde son défaut natif ; le harness intégré lève une erreur.

[Exemple complet et règles détaillées](../../guide/choose-an-agent/).

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom               | Type                                                                         | Présence          | Rôle                                                                                                                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `CliAgentOptions \| CustomAgentOptions \| AgentOptions`                      | Requis            | Harness et sélection de modèle à composer en un agent exécutable.                                                                                                                                                                                                      |
| `options.harness` | `CliHarness \| Harness \| CliHarness \| Harness`                             | Requis            | Preset CLI, par exemple createCodexHarness(), lié à model à la création de l’agent.                                                                                                                                                                                    |
| `options.model`   | `ModelSpec \| undefined \| ModelSpec \| ModelSpec \| undefined \| ModelSpec` | Selon la variante | Nom de modèle ou { name, reasoning, maxOutputTokens } ; le preset refuse ici reasoning ou maxOutputTokens non pris en charge. En son absence, la CLI utilise son modèle par défaut, sauf que l’authentification usage de Kimi et un modelProvider Codex en exigent un. |

## Retour

`CliAgent` · `CustomAgent` · `Agent`

## Signature

```ts
export declare function createAgent(options: CliAgentOptions): CliAgent;
```

## Contrats associés

- [CliAgent](../cliagent/)
- [CliAgentOptions](../support-cliagentoptions/)
