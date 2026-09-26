---
title: "Agents — Vue d’ensemble"
description: "Un agent compose un harness d’exécution et un modèle."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un agent compose un harness d’exécution et un modèle. Le harness définit l’exécution ; le modèle est un nom, ou un objet `AgentModel` qui ajoute un niveau de raisonnement et une limite de sortie. Construire cette configuration ne déclenche ni connexion, ni allocation, ni requête réseau.

## Fonctionnement

Utilisez `agent({ harness: codexHarness(), model: "..." })`, ou les presets `claudeHarness()` et `geminiHarness()`. `harness({ modelProvider, run })` relie un callback de l’appelant à un service de modèles. `sandboxProvider` choisit indépendamment où exécuter les commandes du dépôt.

`agent()` normalise le modèle en `AgentModel` figé et demande au harness ou à son fournisseur de le valider. Un niveau de raisonnement ou une limite de sortie que la CLI ou le service choisi ne sait pas exprimer est refusé immédiatement, avant toute création de sandbox.

## Frontières et responsabilités

Un agent associe une configuration d’exécution et une sélection de modèle. La famille [Harness](../harness/) regroupe les presets CLI, les callbacks personnalisés, les réglages d’authentification et les capacités d’exécution. Les [fournisseurs de modèles](../model-providers/) fournissent les transports HTTP aux harness personnalisés, tandis que `sandboxProvider` choisit indépendamment l’environnement d’exécution.

Ces API de composition sont disponibles depuis la version 5.0.0. Utilisez l’agent avec dispatch, un sandbox ou une tâche de workflow ; sa construction ne déclenche aucune exécution.

## Points d’entrée

- [agent](../../agent/)
- [Agent](../../type-agent/)
- [AgentOptions](../../agentoptions/)
- [CliAgent](../../cliagent/)
- [CustomAgent](../../customagent/)
- [AgentModel](../../agentmodel/)
- [ModelSpec](../../modelspec/)
- [ModelReasoning](../../modelreasoning/)

[Apprendre avec le guide pratique](../../../guide/agents/adapters/).
