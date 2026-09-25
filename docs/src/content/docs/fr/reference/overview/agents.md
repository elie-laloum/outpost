---
title: "Agents — Vue d’ensemble"
description: "Un agent est l’outil de code qui lit une tâche, raisonne sur le dépôt et exécute des actions."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un agent est l’outil de code qui lit une tâche, raisonne sur le dépôt et exécute des actions. Outpost intègre Claude Code, Codex et Gemini CLI via des adapters. Un adapter traduit les demandes Outpost vers le protocole de la CLI native, puis ses sorties en événements et résultats.

## Fonctionnement et philosophie

L’agent reste indépendant de son environnement. `codex()`, `claude()` et `gemini()` configurent ce qui s’exécute ; un provider choisit où. Créer un adapter n’alloue aucune sandbox et ne connecte aucun compte. Le dispatch fournit le brief, supervise l’exécution et collecte le résultat.

## Limites et responsabilités

Les adapters exposent les capacités natives réelles sans prétendre que toutes les CLI fonctionnent à l’identique. Claude et Codex permettent la persistance et la continuation natives des conversations. Gemini prend actuellement en charge les sessions neuves, sans capture native, reprise, fork ni réparation automatique des réponses. Les identifiants doivent être explicitement disponibles dans l’environnement d’exécution.

Pour appeler directement une API sans CLI d’agent, consultez les [fournisseurs de modèles expérimentaux](../model-providers/). Leur première phase ne comprend pas le harness requis pour exécuter les outils d’un agent.

## Points d’entrée

- [claude](../../claude/)
- [codex](../../codex/)
- [gemini](../../gemini/)
- [AgentAdapter](../../agentadapter/)
- [AgentInput](../../agentinput/)
- [agentVersions](../../agentversions/)

[Passer à la pratique avec le Guide](../../../guide/agents/adapters/).
