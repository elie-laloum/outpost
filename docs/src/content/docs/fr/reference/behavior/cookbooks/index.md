---
title: "Cookbooks : de la tâche à la livraison"
description: "Cookbooks : de la tâche à la livraison — Outpost"
sidebar:
  order: 0
---

Chaque recette fournit un script complet, des prérequis, un résultat attendu et le comportement en cas d'échec. Progressez d'une tâche bornée vers un workflow de livraison.

| Niveau        | Recette                                                                | Résultat                                        |
| ------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| Léger         | [Correctif ciblé](../../../guide/cookbook/focused-fix/)                | Une petite modification sur une branche séparée |
| Léger         | [Rapport typé](../../../guide/cookbook/typed-report/)                  | Des données validées pour un autre programme    |
| Intermédiaire | [Codex implémente, Claude relit](../../../guide/cookbook/pair-review/) | Deux agents dans le même workspace              |
| Intermédiaire | [Investigations parallèles](../../../guide/cookbook/parallel/)         | Des branches et résultats indépendants          |
| Avancé        | [Contrôles de livraison](../../../guide/cookbook/delivery-gate/)       | Tests et revue avant intégration                |
| Exploitation  | [Récupération](../../../guide/cookbook/recovery/)                      | Inspecter et reprendre un travail partiel       |

## Installation commune

Utilisez Node.js 24+, un dépôt Git avec un commit, Docker et l'image du [démarrage rapide](../../../guide/start/quickstart/). Choisissez explicitement le provider Podman si nécessaire. Installez les outils du projet dans l'image. Configurez [Claude](../../../guide/agents/connect-claude/) ou [Codex](../../../guide/agents/connect-codex/) avant d'exécuter une recette.

Enregistrez un exemple dans **.outpost/recipe.mts** et lancez **node .outpost/recipe.mts** à la racine du dépôt. Les recettes appellent réellement les modèles ; adaptez budgets et commandes. Les déclarations d'authentification sont lues dans **.outpost/.env** du dépôt, y compris avec les workspaces nommés.

## Gestion des ressources

Un dispatch autonome ferme sa sandbox. **await using** ferme une sandbox réutilisable à la sortie du bloc. Les branches nommées conservent les commits sans fusion dans la branche hôte. Les prompts donnent des instructions, pas des permissions système. Vérifiez les changements et les tests réels. Aucune recette ne pousse automatiquement de branche Git.
