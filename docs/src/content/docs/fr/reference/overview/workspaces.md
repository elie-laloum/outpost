---
title: "Workspaces — Vue d’ensemble"
description: "Un workspace possède l’état Git d’une tâche : checkout, politique de branche, point de départ et verrou."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un workspace possède l’état Git d’une tâche : checkout, politique de branche, point de départ et verrou. Il sépare le travail produit de l’environnement qui le produit. Un même workspace peut ainsi survivre à une sandbox et accueillir des tâches d’agent successives.

## Fonctionnement et philosophie

`openWorkspace` prépare et possède ce contexte Git. La politique de branche choisit le checkout courant ou une branche gérée. Un workspace admet une seule sandbox active à la fois ; le travail parallèle demande des workspaces distincts. L’intégration est explicite et différente de la collecte des commits.

## Limites et responsabilités

Fermez la sandbox avant son workspace. Un workspace fourni par l’appelant reste à sa charge. La fermeture doit préserver le travail modifié, détaché ou autrement récupérable ; le dossier conservé indique où l’examiner. Fermer un workspace ne donne pas l’autorisation de pousser sa branche.

## Points d’entrée

- [openWorkspace](../../openworkspace/)
- [Workspace](../../workspace/)
- [WorkspaceOptions](../../workspaceoptions/)
- [BranchPolicy](../../branchpolicy/)
- [Disposal](../../disposal/)

[Passer à la pratique avec le Guide](../../../guide/environment/workspaces/).
