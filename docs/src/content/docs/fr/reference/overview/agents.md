---
title: "Agents — Vue d’ensemble"
description: "Un agent compose un harness d’exécution et un modèle."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un agent compose un harness d’exécution et un modèle. Le harness définit l’exécution ; le modèle est un nom, ou un objet `AgentModel` qui ajoute un niveau de raisonnement et une limite de sortie. Construire cette configuration ne déclenche ni connexion, ni allocation, ni requête réseau.

## Fonctionnement

Utilisez `createAgent({ harness: createCodexHarness(), model: "..." })`, ou les presets `createClaudeHarness()`, `createAntigravityHarness()`, `createCopilotHarness()` et `createKimiHarness()`. `createHarness({ modelProvider, tools, instructions })` laisse Outpost piloter lui-même un service de modèles. `sandboxProvider` choisit indépendamment où exécuter les commandes du dépôt.

`createAgent()` normalise le modèle en `AgentModel` figé et demande au harness ou à son fournisseur de le valider. Un niveau de raisonnement ou une limite de sortie que la CLI ou le service choisi ne sait pas exprimer est refusé immédiatement, avant toute création de sandbox. Antigravity, Copilot et Kimi n’acceptent qu’un nom de modèle ; Kimi en exige un avec l’authentification `usage`.

`createFallbackAgent([...agents], { on })` regroupe des agents composés dans un `FallbackAgent` ordonné. Le dispatch l’accepte partout où il accepte un agent (`DispatchAgent`) et ne passe la main au candidat suivant que lorsque le candidat courant échoue avec un `FallbackTrigger` listé : `quota` ou `unavailable`. Le `FallbackRecord` du résultat nomme le candidat retenu et la `FallbackAttempt` de chacun de ceux qui se sont arrêtés. L’attache et les continuations explicites exigent un agent unique.

## Frontières et responsabilités

Un agent associe une configuration d’exécution et une sélection de modèle. La famille [Harness](../harness/) regroupe les presets CLI, le moteur intégré, les réglages d’authentification (`AgentAuthentication`, `AccountCredential`, `UsageCredential`) et les capacités d’exécution. Les [fournisseurs de modèles](../model-providers/) fournissent les transports HTTP aux harness personnalisés, tandis que `sandboxProvider` choisit indépendamment l’environnement d’exécution.

Ces API de composition sont disponibles depuis la version 5.0.0. Utilisez l’agent avec dispatch, un sandbox ou une tâche de workflow ; sa construction ne déclenche aucune exécution.

## Points d’entrée

- [createAgent](../../createagent/)
- [Agent](../../type-agent/)
- [AgentOptions](../../agentoptions/)
- [CliAgent](../../cliagent/)
- [CustomAgent](../../customagent/)
- [AgentModel](../../agentmodel/)
- [ModelSpec](../../modelspec/)
- [ModelReasoning](../../modelreasoning/)
- [createFallbackAgent](../../createfallbackagent/)
- [FallbackAgent](../../type-fallbackagent/)

[Apprendre avec le guide pratique](../../../guide/agents/adapters/).
