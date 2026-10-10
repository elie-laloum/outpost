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

### Variante 1 — `CliAgentOptions`

| Nom               | Type                     | Présence  | Rôle                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `CliAgentOptions`        | Requis    | Harness et sélection de modèle à composer en un agent exécutable.                                                                                                                                                                                                      |
| `options.harness` | `CliHarness`             | Requis    | Preset CLI, par exemple createCodexHarness(), lié à model à la création de l’agent.                                                                                                                                                                                    |
| `options.model`   | `ModelSpec \| undefined` | Optionnel | Nom de modèle ou { name, reasoning, maxOutputTokens } ; le preset refuse ici reasoning ou maxOutputTokens non pris en charge. En son absence, la CLI utilise son modèle par défaut, sauf que l’authentification usage de Kimi et un modelProvider Codex en exigent un. |

### Variante 2 — `CustomAgentOptions`

| Nom               | Type                 | Présence | Rôle                                                                                                                                                                                             |
| ----------------- | -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`         | `CustomAgentOptions` | Requis   | Harness et sélection de modèle à composer en un agent exécutable.                                                                                                                                |
| `options.harness` | `Harness`            | Requis   | Harness intégré d’Outpost avec son fournisseur de modèles.                                                                                                                                       |
| `options.model`   | `ModelSpec`          | Requis   | Nom de modèle ou { name, reasoning, maxOutputTokens }. Le model provider refuse ici reasoning ou les limites de sortie non pris en charge ; le service vérifie le nom du modèle lors de l’appel. |

### Variante 3 — `AgentOptions`

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom               | Type                                  | Présence          | Rôle                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `AgentOptions`                        | Requis            | Harness et sélection de modèle à composer en un agent exécutable.                                                                                                                                                                                                      |
| `options.harness` | `CliHarness \| Harness`               | Requis            | Preset CLI, par exemple createCodexHarness(), lié à model à la création de l’agent.                                                                                                                                                                                    |
| `options.model`   | `ModelSpec \| undefined \| ModelSpec` | Selon la variante | Nom de modèle ou { name, reasoning, maxOutputTokens } ; le preset refuse ici reasoning ou maxOutputTokens non pris en charge. En son absence, la CLI utilise son modèle par défaut, sauf que l’authentification usage de Kimi et un modelProvider Codex en exigent un. |

## Retour

`CliAgent` · `CustomAgent` · `Agent`

## Signature

```ts
export declare function createAgent(options: CliAgentOptions): CliAgent;

export declare function createAgent(options: CustomAgentOptions): CustomAgent;

export declare function createAgent(options: AgentOptions): Agent;
```

## Contrats associés

- [Agent](../type-agent/)
- [AgentOptions](../agentoptions/)
- [CliAgent](../cliagent/)
- [CliAgentOptions](../support-cliagentoptions/)
- [CustomAgent](../customagent/)
- [CustomAgentOptions](../support-customagentoptions/)
