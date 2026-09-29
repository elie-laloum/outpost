---
title: "Restauration de récupération — Vue d’ensemble"
description: "Reconstruire un côté d’un transfert distant conservé dans un nouveau dossier, après vérification de ses fichiers, empreintes et historique Git."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir un côté

Un transfert reste sous `.outpost/recovery` quand les changements d’une sandbox cloud n’ont pas pu être appliqués au worktree hôte ; l’erreur `workspace` le désigne dans `details.recovery`. Il contient les deux côtés de cette synchronisation.

| `side`     | Commit                                        | Changements non commités                            | Index Git                                              | Fichiers non suivis |
| ---------- | --------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ | ------------------- |
| `previous` | Dernier commit synchronisé                    | `previous.patch` : les changements du worktree hôte | Restauré depuis `previous-index.patch` (`"preserved"`) | `previous-files/`   |
| `incoming` | `HEAD` de la sandbox, depuis `commits.bundle` | `remote.patch` : les changements de la sandbox      | Non capturé (`"unavailable"`)                          | `incoming/`         |

## Fin d’une restauration

Aucun des deux appels n’écrit dans le dépôt hôte ni dans le transfert. Chacun copie le transfert dans un dossier temporaire et vérifie la copie comme `verifyRecoveryTransfer()` avec empreintes et restaurabilité.

| Événement                                                                               | Résultat                                                                   | Destination                                      |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| `planRecoveryRestore()` réussit tous les contrôles                                      | Se résout avec un `RecoveryRestorePlan`                                    | Non créée                                        |
| La destination existe ou se trouve dans le dépôt, ses métadonnées Git ou le transfert   | Rejette avec le code `configuration`                                       | Non créée                                        |
| Limite d’octets atteinte, empreinte différente ou contrôle Git en échec                 | Rejette avec le code `configuration`                                       | Non créée                                        |
| Transfert, dépôt ou parent de la destination introuvable                                | Rejette avec le code `workspace`                                           | Non créée                                        |
| Transfert sans `state.json` : la synchronisation a échoué avant la sauvegarde de l’hôte | Rejette avec une erreur du système de fichiers                             | Non créée                                        |
| Plan modifié, ou transfert changé depuis la planification                               | `restoreRecoveryTransfer()` rejette avec le code `configuration`           | Non créée                                        |
| Échec du clone, du bundle, d’un patch ou d’une copie de fichier                         | Rejette avec le code `workspace`, en indiquant `destination` et `transfer` | Partielle, conservée                             |
| `restoreRecoveryTransfer()` se termine                                                  | Se résout avec un `RecoveryRestoreResult`, `sourceRetained: true`          | Clone détaché sur `commit`, sans remote `origin` |

:::caution
Une restauration en échec conserve sa destination partielle, et une nouvelle tentative vers le même chemin est refusée. Supprimez-la ou choisissez une autre destination.
:::

## Points d’entrée

Guide : [Récupérer du travail](../../../guide/recovery/) · [Sandboxes cloud](../../../guide/cloud-sandboxes/)

- [planRecoveryRestore](../../planrecoveryrestore/)
- [restoreRecoveryTransfer](../../restorerecoverytransfer/)
- [RecoveryRestoreOptions](../../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../../recoveryrestoreplan/)
- [RecoveryRestoreResult](../../recoveryrestoreresult/)
- [RecoveryChecksumResult](../../support-recoverychecksumresult/)
- [StorageInventory](../../support-storageinventory/)
- [WorkspaceGitInspection](../../support-workspacegitinspection/)
- [LockInspection](../../support-lockinspection/)
