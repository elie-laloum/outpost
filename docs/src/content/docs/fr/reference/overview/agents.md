---
title: "Agents — Vue d’ensemble"
description: "Un agent compose un harness d’exécution et un identifiant de modèle."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un agent compose un harness d’exécution et un identifiant de modèle. Le harness définit l’exécution ; le modèle est une chaîne transmise à la CLI ou au service. Construire cette configuration ne déclenche ni connexion, ni allocation, ni requête réseau.

## Fonctionnement

Utilisez `agent({ harness: codexHarness(), model: "..." })`, ou les presets `claudeHarness()` et `geminiHarness()`. `harness({ modelProvider, run })` relie un callback de l’appelant à un service de modèles. `sandboxProvider` choisit indépendamment où exécuter les commandes du dépôt.

## Frontières et responsabilités

Un agent associe une configuration d’exécution et une sélection de modèle. La famille [Harness](../harness/) regroupe les presets CLI, les callbacks personnalisés, les réglages d’authentification et les capacités d’exécution. Les [fournisseurs de modèles](../model-providers/) fournissent les transports HTTP aux harness personnalisés, tandis que `sandboxProvider` choisit indépendamment l’environnement d’exécution.

Ces API de composition sont implémentées mais non publiées. Utilisez l’agent avec dispatch, un sandbox ou une tâche de workflow ; sa construction ne déclenche aucune exécution.

## Points d’entrée

- [agent](../../agent/)
- [Agent](../../type-agent/)
- [AgentOptions](../../agentoptions/)
- [CliAgent](../../cliagent/)
- [CustomAgent](../../customagent/)

[Apprendre avec le guide pratique](../../../guide/agents/adapters/).
