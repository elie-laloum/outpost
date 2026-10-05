---
title: "Commencer avec Outpost"
description: "Lancez un agent de code depuis TypeScript, puis ajoutez des vérifications et des workflows selon vos besoins."
---

## Ce que vous pouvez faire avec Outpost

Outpost est une bibliothèque TypeScript qui permet de faire travailler des agents de code sur des dépôts Git. Votre code choisit l’agent, son environnement d’exécution et la branche qu’il modifie. Le résultat contient sa réponse, ses commits et la consommation de tokens qu’il a déclarée.

Commencez par une tâche. Si votre travail demande plusieurs étapes, un workflow les relie et transmet leurs résultats d’une tâche à la suivante.

## Lancer votre première tâche

Suivez ces trois pages dans l’ordre. Elles utilisent Docker et Codex pour vous donner un point de départ fonctionnel.

<!-- path -->

1. [Installer Outpost](../setup/): Construisez l’image et créez votre configuration TypeScript.
2. [Votre première tâche](../first-request/): Écrivez un script, lisez la réponse et examinez une modification sur sa branche.
3. [Créer un workflow](../first-workflow/): Reliez deux tâches et récupérez leurs résultats.

## Comprendre les éléments de base

L’**agent** réalise le travail, la **sandbox** exécute ses commandes et le **workspace** est la copie du dépôt qu’il modifie. Vous les choisissez séparément. La page [Comment Outpost exécute une tâche](../how-it-works/) explique leur durée de vie et ce que deviennent les fichiers.

Pour connaître les options et le type de retour exacts d’une fonction, consultez la [référence API](../../reference/). Le guide explique comment utiliser ces fonctions ensemble.

## Continuer selon votre besoin

Choisissez le sujet qui correspond à votre prochaine étape. Vous pourrez revenir aux autres guides au moment où vous en aurez besoin.

<!-- features -->

- [Rédiger les consignes de l’agent](../briefs/): Utilisez du texte ou un fichier Markdown réutilisable.
- [Vérifier le travail et réessayer](../verification-loops/): Lancez les tests et renvoyez les échecs pour une nouvelle tentative.
- [Choisir un agent](../choose-an-agent/): Configurez l’agent indépendamment de sa sandbox.
- [Réutiliser une sandbox](../sandbox-sessions/): Exécutez des commandes et plusieurs échanges sur les mêmes fichiers.
- [Attendre une approbation](../approvals/): Demandez un accord avant de lancer la tâche suivante.
- [Exécuter depuis la CI](../ci-automation/): Lancez votre script dans un job automatisé.

Pour un exemple complet, essayez de [réparer une CI en échec](../fix-failing-ci/) ou de [créer un workflow de développement](../development-workflow/).
