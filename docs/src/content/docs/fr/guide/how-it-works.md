---
title: "Comment Outpost exécute une tâche"
description: "Comprendre la durée de vie des ressources et ce qui reste après une tâche."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="trois-choix-pour-chaque-tâche"></span>
<span id="un-appel-à-dispatch"></span>
<span id="garder-un-environnement-pour-plusieurs-opérations"></span>
<span id="séparer-le-workspace-de-la-sandbox"></span>
<span id="retrouver-les-fichiers-après-une-exécution"></span>

## Agent, sandbox et workspace

L’**agent** reçoit la tâche et renvoie une réponse. Un harness CLI lance l’outil de l’agent ; le harness intégré appelle une API de modèle avec vos outils. La **sandbox** exécute les commandes. Le **workspace** contient les fichiers et, dans le cas Git, la branche.

Ces choix sont indépendants. Changer d’agent n’impose pas de changer d’environnement. Remplacer la sandbox n’impose pas d’abandonner un workspace que vous gérez.

## De la demande au nettoyage

Un appel ponctuel à `dispatch()` gère les ressources qu’il crée. C’est le cycle suivi par [votre première tâche](../first-request/).

<!-- canvas -->

- **Préparer les fichiers** : Ouvrir le workspace choisi par le dépôt et la politique de branche.
  - Outpost
  - → **Ouvrir la sandbox** : workspace prêt
- **Ouvrir la sandbox** : Allouer l’environnement et préparer l’accès de l’agent ainsi que les outils du projet.
  - Outpost
  - → **Exécuter la tâche** : préparation terminée
- **Exécuter la tâche** : Envoyer le brief, recueillir l’activité et attendre la fin.
  - Agent
  - → **Recueillir le résultat** : processus terminé
- **Recueillir le résultat** : Synchroniser les changements distants et appliquer la politique de branche choisie.
  - Outpost
  - → **Fermer les ressources** : résultat ou échec
- **Fermer les ressources** : Libérer la sandbox et préserver le travail nécessaire à la relecture ou à la récupération.
  - Outpost

Une branche nommée reste disponible pour la relecture. L’intégration automatique ne s’applique que si la politique de branche la demande. Les worktrees modifiés ou détachés peuvent rester après le nettoyage. La réponse décrit ce que l’agent rapporte ; vos vérifications décident si le travail est acceptable.

## Garder un environnement ouvert

Un nouveau dispatch ne réutilise pas les dépendances installées ni les fichiers temporaires de la sandbox précédente. Ouvrez une [session de sandbox](../sandbox-sessions/) pour plusieurs échanges et commandes sur les mêmes fichiers. `await using` la ferme à la sortie du bloc, y compris après une erreur.

Un workspace peut survivre à cette sandbox. Ouvrez-le vous-même si les étapes suivantes doivent reprendre sa branche ou ses fichiers dans un autre environnement. Fermez la sandbox courante avant d’en ouvrir une autre sur ce workspace, puis fermez le workspace en dernier. Une ressource empruntée reste sous la responsabilité de son appelant.

Une sandbox accepte une seule opération à la fois. Pour travailler en parallèle, utilisez des sandboxes et workspaces distincts. Le guide [Plusieurs dépôts](../multiple-repositories/) explique leur gestion indépendante.

## Retrouver le travail

L’exécution Git conserve ses données sous `.outpost` dans le dépôt cible, même si les scripts se trouvent ailleurs. Les conversations natives des agents peuvent utiliser leurs propres emplacements sur l’hôte. Le guide [Stockage](../storage/) décrit ces emplacements et les données transférables vers un transport.

Les workspaces de dossier et éphémères séparent leurs fichiers du répertoire d’exécution et ne nécessitent aucun dépôt Git. Le guide [Travailler sans Git](../working-with-files/) décrit copies, montages et snapshots. La [publication de fichiers](../publishing-files/) est explicite : fermer un workspace ne la déclenche pas.

En cas d’échec, [examinez le travail conservé](../recovery/) avant de réessayer. Un nettoyage échoué peut laisser des ressources à récupérer ; un checkpoint ou un snapshot ne prouve pas qu’un processus abandonné s’est arrêté.
