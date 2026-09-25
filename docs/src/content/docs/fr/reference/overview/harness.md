---
title: "Harness — Vue d’ensemble"
description: "Un harness définit comment un agent exécute une tâche et accède à son modèle."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un harness définit comment un agent exécute une tâche et accède à son modèle. Les presets CLI et les harness définis par l’appelant se composent avec un identifiant de modèle via `agent({ harness, model })`. Cette famille regroupe leurs fonctions de création, contrats d’exécution, réglages et adaptateurs de protocole CLI.

## Fonctionnement

Choisissez `claudeHarness()`, `codexHarness()` ou `geminiHarness()` pour déléguer l’exécution à la CLI correspondante. Leurs options configurent l’exécution, l’authentification explicite et les conversations prises en charge. Utilisez `harness({ modelProvider, run })` pour fournir votre callback d’exécution relié à un [fournisseur de modèles](../model-providers/). Sélectionnez le modèle sur l’[agent](../agents/) ; un harness personnalisé exige un modèle explicite, tandis qu’un preset CLI peut conserver son modèle natif par défaut.

## Frontières et responsabilités

Construire un harness ne lance ni processus, ni connexion, ni requête réseau. La CLI possède sa boucle interne modèle/outils. Claude et Codex prennent en charge capture, reprise et fork natifs ; Gemini prend en charge les sessions neuves.

Un callback personnalisé tourne dans le processus Outpost, emprunte son sandbox pour les opérations sur le dépôt et respecte l’annulation. Il n’a ni conversations natives, ni réparations automatiques de réponse, ni terminal interactif. Le moteur générique d’outils reste prévu. `AgentAdapter` et `AgentInput` décrivent la construction des commandes CLI et le décodage des événements ; `HarnessInput`, `HarnessContext` et `HarnessRun` décrivent l’exécution personnalisée. L’allocation du sandbox relève de [Providers](../providers/).

Ces API de harness sont implémentées mais non publiées.

## Points d’entrée

- [harness](../../function-harness/) définit votre callback d’exécution.
- [claudeHarness](../../claudeharness/), [codexHarness](../../codexharness/) et [geminiHarness](../../geminiharness/) configurent les presets CLI.
- [Harness](../../harness/) est le contrat commun de composition.
- [HarnessContext](../../harnesscontext/) décrit le modèle, le fournisseur, le sandbox, le signal d’annulation et l’observateur accessibles au callback.
- [AgentAdapter](../../agentadapter/) décrit l’adaptateur de protocole CLI.

[Apprendre avec le guide pratique](../../../guide/agents/adapters/). Pour un exemple complet de callback, consultez [les fournisseurs de modèles et les harness personnalisés](../../../guide/advanced/model-providers/).
