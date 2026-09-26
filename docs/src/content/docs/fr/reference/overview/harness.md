---
title: "Harness — Vue d’ensemble"
description: "Un harness définit comment un agent exécute une tâche et accède à son modèle."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un harness définit comment un agent exécute une tâche et accède à son modèle. Les presets CLI et le moteur d’Outpost se composent avec un modèle via `agent({ harness, model })`. Cette famille regroupe leurs fonctions de création, les définitions d’outils et d’instructions, les contrats d’exécution, les réglages et les adaptateurs de protocole CLI.

## Fonctionnement

Choisissez `claudeHarness()`, `codexHarness()` ou `geminiHarness()` pour déléguer l’exécution à la CLI correspondante. Leurs options configurent l’exécution, l’authentification explicite et les conversations prises en charge.

Utilisez `harness()` pour qu’Outpost pilote lui-même le modèle. Il combine un [fournisseur de modèles](../model-providers/), des outils issus de `defineHarnessTool()` et `defineHarnessToolset()`, des instructions en texte ou via `defineHarnessInstructions()`, des hooks, des permissions, des limites de boucle et des réglages d’exécution des outils. Sélectionnez le modèle sur l’[agent](../agents/) ; un harness personnalisé exige un modèle explicite, tandis qu’un preset CLI peut conserver son modèle natif par défaut.

## Frontières et responsabilités

Construire un harness ne lance ni processus, ni connexion, ni requête réseau. Une CLI possède sa boucle interne modèle/outils. Claude et Codex prennent en charge capture, reprise et fork natifs ; Gemini prend en charge les sessions neuves.

Le moteur d’Outpost tourne dans le processus Outpost. Chaque étape est une requête au modèle ; les outils passent par le sandbox emprunté, et les limites font échouer la passe avec le code `limit` au lieu de réussir. Il n’a pas encore de conversations persistées, de réparations automatiques de réponse ni de terminal interactif. `AgentAdapter` et `AgentInput` décrivent la construction des commandes CLI et le décodage des événements. L’allocation du sandbox relève de [Providers](../providers/).

Ces API de harness sont implémentées mais non publiées ; le moteur et ses définitions sont expérimentaux.

## Points d’entrée

- [harness](../../function-harness/) compose le moteur d’Outpost.
- [defineHarnessTool](../../defineharnesstool/), [defineHarnessToolset](../../defineharnesstoolset/) et [defineHarnessInstructions](../../defineharnessinstructions/) déclarent ce que le moteur peut utiliser.
- [harnessFileTools](../../harnessfiletools/), [harnessEditTools](../../harnessedittools/), [harnessSearchTools](../../harnesssearchtools/), [harnessGitTools](../../harnessgittools/) et [harnessShellTools](../../harnessshelltools/) fournissent des outils de dépôt.
- [defineHarnessHook](../../defineharnesshook/) et [defineHarnessPermissions](../../defineharnesspermissions/) contrôlent les appels d’outils et la fin de la boucle.
- [claudeHarness](../../claudeharness/), [codexHarness](../../codexharness/) et [geminiHarness](../../geminiharness/) configurent les presets CLI.
- [Harness](../../harness/) est le contrat commun de composition.
- [HarnessToolContext](../../harnesstoolcontext/) décrit le sandbox, le signal d’annulation, le modèle et l’observateur accessibles à un outil.
- [AgentAdapter](../../agentadapter/) décrit l’adaptateur de protocole CLI.

[Apprendre avec le guide pratique](../../../guide/agents/harness/). Pour les presets CLI, consultez [le guide des adapters](../../../guide/agents/adapters/).
