---
title: "Comment les changements distants reviennent dans le dépôt"
description: "Comprendre les transferts, la synchronisation et le travail conservé en cas d’échec."
---

Les sandboxes cloud et les conteneurs à Git privé modifient une copie séparée du dépôt. Cette page explique quels fichiers sont transférés et pourquoi la synchronisation peut s’arrêter. Pour configurer l’environnement, consultez les [sandboxes cloud](../cloud-sandboxes/) ou [Git privé](../private-git/).

## Accès au dépôt

La sandbox travaille sur sa propre copie du dépôt. Outpost la maintient alignée sur le worktree géré de votre machine. Les sandboxes [Firecracker](../firecracker/) et les conteneurs en [Git privé](../private-git/) se synchronisent de la même façon.

`repositoryMode: "isolated"` rend le checkout privé explicite sur les deux fournisseurs ; l’omettre conserve le même comportement. Les fichiers de configuration Git et les hooks hôtes ne sont pas envoyés, et la synchronisation n’importe ni configuration, ni hooks, ni refs sans rapport du sandbox. L’historique de toutes les branches et de tous les tags hôtes reste inclus dans le bundle envoyé. L’option explicite est couverte par des fixtures déterministes des fournisseurs ; sa validation cloud réelle reste à effectuer.

<!-- canvas -->

- **Envoyer**: Copier l’historique Git et les fichiers sélectionnés dans la sandbox.
  - Hôte
  - → **Travailler**: sandbox prête
- **Travailler**: Exécuter un agent ou une commande à distance.
  - Sandbox
  - → **Vérifier le retour**: terminé
- **Vérifier le retour**: Télécharger et valider les modifications ; vérifier les changements concurrents sur l’hôte.
  - Hôte
  - → **Appliquer**: retour validé
  - → **Récupérer**: conflit / échec
- **Appliquer**: Mettre à jour la branche de travail et les fichiers locaux.
  - Hôte
- **Récupérer**: Conserver les données de récupération pour examen.
  - Hôte

## Choisir la branche

Sans `branch`, une sandbox cloud utilise `integrate` : une nouvelle branche `outpost/job-…`, fusionnée dans votre branche courante à la fin. `named` garde le travail sur une branche que vous nommez. `current` est refusé, car la sandbox ne peut pas modifier votre checkout sur place. Voir [Dépôt et branche](../workspaces/).

## Envoyer des fichiers absents de Git

Commitez les fichiers nécessaires avant de lancer la tâche. Pour une configuration de test ignorée par Git ou d’autres fichiers locaux, consultez les options du workspace et de synchronisation ci-dessous.

Référence API : [WorkspaceOptions](../../reference/workspaceoptions/) et [SandboxOptions](../../reference/sandboxoptions/).

:::caution
`includeUncommitted` lit le worktree géré sous `.outpost/workspaces`, pas votre checkout. Les modifications non commitées de votre checkout n’atteignent la sandbox que par `copies`.
:::

Une copie exclue par `.gitignore` voyage dans un seul sens : les modifications que l’agent y apporte restent dans la sandbox. Toute autre copie devient du travail non commité dans le worktree : passez alors `includeUncommitted: true`.

## Quand la synchronisation s’arrête

Outpost n’écrase jamais un travail qu’il ne peut pas sauvegarder. Il s’arrête sur une erreur de code `workspace` dont `details.recovery` désigne le dossier de `.outpost/recovery` qui contient les changements téléchargés et la sauvegarde. Inspectez-le avec [Récupérer du travail](../recovery/).

| Cause                                                                             | Solution                                                                   |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Le worktree géré a changé pendant que la sandbox était ouverte                    | Ne touchez pas à `.outpost/workspaces` pendant l’exécution                 |
| L’agent a modifié un fichier non commité dans le worktree                         | Commitez d’abord le fichier, ou passez `includeUncommitted: true`          |
| Une copie n’est pas exclue par le `.gitignore` commité (première synchronisation) | Passez `includeUncommitted: true`, ou ignorez le fichier dans `.gitignore` |
| L’agent a créé un fichier que votre hôte ignore hors de `.gitignore`              | Déplacez la règle d’exclusion dans le `.gitignore` commité                 |
| L’agent a réécrit un commit déjà synchronisé                                      | Demandez de nouveaux commits plutôt qu’un amend ou un rebase               |

`recoveryTransport` sur `dispatch()` ou `createSandbox()` archive aussi chaque sauvegarde dans un [stockage objet](../object-storage/).
