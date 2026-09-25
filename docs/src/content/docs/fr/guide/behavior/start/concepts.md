---
title: "Concepts et propriété des ressources"
description: "Concepts et propriété des ressources — Outpost"
sidebar:
  order: 3
---

## Quatre éléments essentiels

| Concept           | Responsabilité                                     | Durée de vie habituelle                |
| ----------------- | -------------------------------------------------- | -------------------------------------- |
| Workspace         | Copie Git, branche, verrous et intégration         | Une fonctionnalité ou plusieurs tâches |
| Sandbox           | Environnement actif rattaché à un workspace        | Une tâche ou une session réutilisable  |
| Adapter d’agent   | Commande du CLI natif et traduction des événements | Configuration réutilisable             |
| Tâche de workflow | Opération typée et dépendances                     | Un nœud du graphe                      |

Pour Claude Code et Codex, une conversation est indépendante : son transcript natif peut survivre à la sandbox et être repris plus tard. Dupliquer une conversation ne duplique pas ses fichiers.

## Choisir le point d’entrée

Utilisez `dispatch` pour une tâche avec nettoyage automatique. Utilisez `createSandbox` pour réutiliser les dépendances installées et l’état de l’environnement. Utilisez `openWorkspace` pour faire intervenir plusieurs environnements ou agents sur une même branche au fil du temps. Utilisez `attach` pour une session interactive native.

`dispatch` et `attach` ferment les ressources qu’ils ont créées. Un workspace fourni par l’appelant reste sous sa responsabilité. Fermez la sandbox avant son workspace. Les handles acceptent `await using` ou un appel explicite et idempotent à `close()`.

Une sandbox accepte une seule opération à la fois. Un workspace ne peut appartenir qu’à une sandbox active à la fois. Pour travailler en parallèle, allouez des workspaces et sandboxes distincts. La concurrence d’un workflow ne supprime pas ces règles.

## Le nettoyage conserve le travail

Fermer un worktree géré et propre supprime son répertoire ; les branches nommées restent. Un worktree contenant des modifications est conservé, avec son chemin dans `retainedDirectory`. Utilisez `close({ preserve: true })` pour conserver aussi un worktree propre. Le mode utilisant la copie courante ne supprime pas votre projet.

Consultez le [cycle de vie](../../../environment/lifecycle/), la [récupération](../../../operations/recovery/) et les [limites de sécurité](../../../operations/security/).
