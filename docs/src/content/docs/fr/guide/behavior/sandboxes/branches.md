---
title: "Branches et intégration Git"
description: "Branches et intégration Git — Outpost"
sidebar:
  order: 3
---

Choisissez le lien entre les changements de l’agent et votre copie locale avant de démarrer.

| Politique                                              | Comportement                                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `{ mode: "current" }`                                  | Utilise votre copie courante. Valeur par défaut des providers montés et locaux.                |
| `{ mode: "named", name: "feature/fix", from: "main" }` | Crée ou réutilise un worktree géré pour la branche nommée.                                     |
| `{ mode: "integrate", from: "main" }`                  | Crée une branche temporaire dont les commits peuvent rejoindre la branche d’origine de l’hôte. |

`from` est facultatif et accepte une référence de commit Git. Les providers distants utilisent `integrate` par défaut et refusent `current`.

## Règles d’intégration

Le dispatch ponctuel intègre les commits lorsque cela est demandé. Une sandbox réutilisable attend un appel à `sandbox.workspace.integrate()`. L’intégration nécessite une branche attachée sur l’hôte, utilise un verrou de fusion et refuse un changement inattendu de branche sur l’hôte. Elle ne bascule pas votre copie vers la branche de l’agent.

Les changements non commités restent dans le workspace ; ils ne deviennent pas automatiquement des commits. Un conflit conserve le workspace géré pour inspection. Examinez `retainedDirectory` ou les [informations de récupération](../../../operations/recovery/) avant de nettoyer.

Les worktrees gérés résident dans `.outpost/workspaces`. Si une branche nommée est déjà utilisée ailleurs, Outpost échoue au lieu de la déplacer. Une branche nommée existante est réutilisée. La fermeture d’un worktree propre supprime son répertoire, mais garde la branche nommée.

## Travail parallèle

Attribuez des noms de branche distincts aux tâches parallèles. L’intégration sur l’hôte est séquentielle, mais cela ne résout pas les conflits sémantiques entre changements indépendants. Prévoyez une étape de revue et d’intégration.

Les verrous enregistrent le PID propriétaire. Un propriétaire actif empêche les accès concurrents ; un verrou abandonné peut être récupéré. Ne supprimez pas un verrou actif pour forcer l’accès.
