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

La CLI possède sa boucle interne modèle/outils. Claude et Codex conservent capture, reprise et fork natifs ; Gemini prend en charge les sessions neuves. Un callback personnalisé tourne dans le processus Outpost, emprunte son sandbox et respecte l’annulation. Il n’a ni conversations natives, ni réparations automatiques, ni terminal interactif. Le moteur d’outils intégré reste prévu.

Ces API sont implémentées mais non publiées. Les [fournisseurs de modèles](../model-providers/) traitent les requêtes texte bornées ; ils n’allouent pas de sandbox.

## Points d’entrée

- [agent](../../agent/)
- [harness](../../function-harness/)
- [claudeHarness](../../claudeharness/)
- [codexHarness](../../codexharness/)
- [geminiHarness](../../geminiharness/)
- [AgentAdapter](../../agentadapter/)

[Apprendre avec le guide pratique](../../../guide/agents/adapters/).
