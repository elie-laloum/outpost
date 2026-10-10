---
title: "Choisir les fichiers de travail"
description: "Choisir des branches Git, une copie de dossier ou un espace vide."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="workspaces-git"></span>
<span id="workspaces-de-fichiers"></span>

Un workspace fournit les fichiers de travail ; une sandbox exécute les commandes et les agents. Choisissez la source selon les fichiers disponibles et la manière de récupérer les changements.

## Choisir une source

| Source                   | Utilisation                                       | Récupérer les changements                               |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------- |
| `git`                    | Dépôt existant, historique et branches            | Conserver une branche ou intégrer ses commits           |
| `directory` avec copie   | Traiter un dossier en gardant sa source intacte   | Publier les fichiers sélectionnés vers une destination  |
| `directory` avec montage | Exposer la source sous un sous-répertoire déclaré | Les écritures d'un montage inscriptible sont immédiates |
| `ephemeral`              | Commencer avec une racine vide                    | Publier les fichiers produits ou conserver un snapshot  |

Les appels Git existants conservent leurs valeurs par défaut. Utilisez `createWorkspace()` pour ouvrir une source déclarée, `workspaceSource` pour laisser un wrapper allouer la ressource, ou `workspace` pour emprunter une ressource déjà ouverte. Les callbacks, décisions et workflows JSON sans fichiers utilisent directement le moteur de workflows.

## Séparer workspace et sandbox

Un workspace sert une seule sandbox à la fois et peut être réutilisé après sa fermeture. Fermez la sandbox avant le workspace. Une sandbox qui emprunte un workspace laisse sa fermeture au appelant ; les wrappers qui allouent leurs ressources gèrent leur cycle de vie. La page [Fonctionnement](../how-it-works/) détaille cette propriété.

## Pour continuer

- [Travailler sur une branche Git](../git-workspaces/)
- [Traiter des fichiers sans Git](../working-with-files/)
- [Publier les fichiers sélectionnés](../publishing-files/)
- [Vérifier avant de fusionner](../integrating-changes/)

<span id="choisir-le-dépôt-de-travail"></span>
<span id="choisir-la-stratégie-de-branche"></span>
<span id="réutiliser-un-workspace-pour-plusieurs-sandboxes"></span>
<span id="copier-des-fichiers-ignorés-dans-le-worktree"></span>
<span id="récupérer-le-travail-conservé"></span>
<span id="limites"></span>

<span id="refuser-les-changements-commités-indésirables"></span>
<span id="conditionner-lintégration-à-une-vérification"></span>
<span id="résoudre-les-conflits-de-fusion-avec-un-agent"></span>

<span id="exécuter-une-commande-dans-un-workspace-éphémère"></span>
<span id="monter-une-source-explicitement"></span>
<span id="conserver-et-reprendre-les-fichiers"></span>
<span id="exécuter-des-jobs-indépendants"></span>
<span id="vérifier-les-capacités-et-récupérer-une-publication"></span>

<span id="copier-puis-restituer-un-dossier"></span>
