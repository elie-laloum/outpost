---
title: "Récupérer du travail"
description: "Inspecter l’état conservé avant de restaurer le travail."
---

Lorsqu’une synchronisation ou intégration échoue, inspectez le `retainedDirectory` indiqué et les détails de récupération avant toute suppression. Les données conservées peuvent être l’unique copie du travail de l’agent.

## Inspecter

```sh
npx outpost recovery inspect --repository /projects/app --git --locks --resources --json
```

Le rapport inventorie workspaces locaux, propriété et activité. Une activité distante est une observation ; son PID ne prouve pas qu’un processus distant est vivant ou arrêté.

## Vérifier un transfert

```sh
npx outpost recovery verify --directory /path/to/transfer --checksums --restorability --repository /projects/app
```

La vérification contrôle les données conservées et, si demandé, leurs empreintes et leur restaurabilité. Elle n’applique rien au checkout original.

## Restaurer dans un nouveau dossier

```sh
npx outpost recovery restore --directory /path/to/transfer --repository /projects/app --destination /projects/recovered --side incoming
```

Cette commande prévisualise le plan. Ajoutez `--apply` après revue. Choisissez `previous` pour restaurer la version sauvegardée. La destination doit respecter le contrat de restauration ; utilisez un dossier neuf et comparez l’état récupéré avant intégration.

Pour une archive distante, `materializeRecoveryArchive()` restaure d’abord le staging. `archiveRecovery()` publie les données vérifiées via un transport. Gardez l’archive et le staging local jusqu’à la fin de la récupération.

API : [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [archiveRecovery](../../reference/archiverecovery/).
