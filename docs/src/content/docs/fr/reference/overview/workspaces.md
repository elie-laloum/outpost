---
title: "Workspaces — Vue d’ensemble"
description: "Un workspace possède l’état Git d’une tâche : checkout ou worktree, branche, verrou et moment de la fusion."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir une politique de branche

`branch` détermine où l’agent travaille et ce que font `integrate()` et `close()`. Un verrou déjà pris échoue avec le code `conflict` au lieu d’attendre.

| Mode        | L’agent travaille dans                                      | Verrou pris sur | `integrate()`                       | `close()` sur un worktree propre                    |
| ----------- | ----------------------------------------------------------- | --------------- | ----------------------------------- | --------------------------------------------------- |
| `current`   | Votre checkout, sur sa branche courante                     | Le checkout     | Ne fait rien                        | Laisse tout en place                                |
| `named`     | Un worktree sous `.outpost/workspaces/` sur `name`          | Cette branche   | Ne fait rien                        | Supprime le worktree, garde la branche              |
| `integrate` | Un worktree sur une nouvelle branche `outpost/<label>-<id>` | Cette branche   | La fusionne dans la branche de base | Supprime le worktree, supprime la branche fusionnée |

`copies` exige `named` ou `integrate`, et les providers de sandbox distants refusent `current`.

## Cycle de vie

Un workspace survit à ses sandboxes : il en sert une seule à la fois et reste ouvert jusqu’à ce que vous le fermiez.

| Appel                                             | Sandbox                                     | Effet Git                                                                      |
| ------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `openWorkspace(options)`                          | Aucune                                      | Prend le verrou, prépare le worktree, copie `copies`, exécute `workspaceReady` |
| `workspace.sandbox()`                             | Nouvelle, ouverte jusqu’à sa fermeture      | Aucun ; la fermer laisse le workspace ouvert et non fusionné                   |
| `workspace.dispatch()` / `workspace.attach()`     | Nouvelle, fermée après l’exécution          | Fusionne une branche `integrate` quand l’exécution réussit                     |
| `workspace.integrate()`                           | —                                           | `git merge` dans la branche de base ; `conflict` si la branche hôte a changé   |
| `workspace.close()`                               | Doit déjà être fermée                       | Libère le verrou et supprime un worktree propre                                |
| `dispatch()` / `createSandbox()` sans `workspace` | Possède un workspace qu’elle ouvre et ferme | Même politique, fermé avec la sandbox                                          |

:::note
La fermeture conserve un worktree dont le `HEAD` est détaché ou qui contient des fichiers modifiés, non suivis ou ignorés, copies comprises, et le renvoie dans `retainedDirectory`. Outpost ne pousse jamais une branche.
:::

## Points d’entrée

Guide : [Dépôt et branche](../../../guide/repository-and-branch/) · [Sessions de sandbox](../../../guide/sandbox-sessions/) · [Récupérer du travail](../../../guide/recovery/)

- [openWorkspace](../../openworkspace/)
- [Workspace](../../workspace/)
- [WorkspaceOptions](../../workspaceoptions/)
- [BranchPolicy](../../branchpolicy/)
- [LifecycleHooks](../../lifecyclehooks/)
- [StageLimits](../../stagelimits/)
- [WorkspaceRecord](../../workspacerecord/)
- [Disposal](../../disposal/)
