---
title: Commencer avec Outpost
description: Lancez une tâche, examinez son résultat et ajoutez un workflow lorsque plusieurs étapes deviennent nécessaires.
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="ce-que-vous-pouvez-faire-avec-outpost"></span>
<span id="lancer-votre-première-tâche"></span>
<span id="comprendre-les-éléments-de-base"></span>
<span id="continuer-selon-votre-besoin"></span>

Outpost exécute des agents de code depuis votre programme TypeScript ou une recette YAML. Vous choisissez l’agent, son environnement et la destination de ses changements. Commencez par une tâche dont vous pouvez examiner la réponse et les fichiers.

## Obtenir un premier résultat

Le parcours recommandé utilise Codex dans Docker sur un dépôt Git. Il vous faut Node.js 24+, Git, Docker et un accès à l’agent. Vous pourrez ensuite choisir d’autres agents et environnements.

<!-- path -->

1. [Installer Outpost](../setup/) : Installer le paquet, construire l’image et enregistrer la configuration.
2. [Lancer une première tâche](../first-request/) : Demander une revue du README et lire la réponse.
3. [Relier deux tâches](../first-workflow/) : Transmettre le résultat de l’agent à votre propre code.

Vous préférez un fichier déclaratif ? Après l’installation, suivez [Votre première recette YAML](../yaml-recipes/). La recette décrit le travail ; une configuration locale séparée choisit le dépôt, la sandbox et les identifiants.

## Choisir la suite

Ces guides sont utilisables sans construire un workflow complet.

<!-- features -->

- [Tester les changements de l’agent](../sandbox-sessions/) : Exécuter l’agent et vos tests dans le même environnement.
- [Recevoir des données validées](../typed-responses/) : Vérifier une réponse JSON avant de l’utiliser.
- [Relire une branche](../git-workspaces/) : Garder les changements séparés et décider de leur intégration.
- [Enregistrer un rapport](../run-reports/) : Préparer un document pour la relecture.
- [Continuer une conversation](../conversations/) : Envoyer une nouvelle demande en conservant le contexte.
- [Récupérer un travail interrompu](../recovery/) : Examiner ce qui reste avant de réessayer ou de nettoyer.

## Comprendre ce que vous contrôlez

L’**agent** interprète la tâche. La **sandbox** fournit son environnement d’exécution. Le **workspace** fournit les fichiers de travail. La page [Comment Outpost exécute une tâche](../how-it-works/) explique leurs durées de vie.

Une consigne comme « lance les tests » guide l’agent. Pour exiger leur réussite avant d’accepter les changements, exécutez la vérification dans votre code avec une [boucle de vérification](../verification-loops/) ou une [intégration contrôlée](../integrating-changes/).

Le Guide rassemble tutoriels, tâches pratiques et explications. L’[API](../../reference/) décrit précisément les signatures, options et résultats. Les [exemples complets](../fix-failing-ci/) montrent comment assembler ces éléments lorsque vous en avez besoin.
