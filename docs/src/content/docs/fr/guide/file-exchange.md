---
title: "Échange de fichiers"
description: "Déplacer l’état du dépôt sans perdre les changements hôte."
---

Les fournisseurs montés voient le workspace via le montage hôte actif. Les fournisseurs distants téléversent un snapshot puis synchronisent les changements en retour. Votre application utilise les mêmes opérations de sandbox, mais la propriété des fichiers diffère.

## Entrées distantes

`copies` sélectionne des fichiers supplémentaires relatifs au dépôt. `includeUncommitted` inclut les modifications hôte dans le snapshot distant. Envoyez uniquement les entrées nécessaires ; l’allocation distante les téléverse dans votre compte cloud.

## Synchronisation

Avant d’appliquer les changements entrants, Outpost valide le transfert et sauvegarde l’état hôte. Si l’hôte a changé entre-temps, la synchronisation échoue au lieu de l’écraser silencieusement. Conservez le dossier de transfert indiqué et utilisez la [récupération après échec](../failure-recovery/) pour inspecter les deux versions.

## Transferts du fournisseur

Pour implémenter un fournisseur, `SandboxLease.upload()` et `download()` transfèrent les fichiers et contenus de dossiers avec annulation et délais. Préservez les octets binaires, modes pris en charge et liens symboliques. Les transferts de conteneurs doivent voir tmpfs et les autres montages actifs.

Les capacités optionnelles `fileTransfers` proposent manifestes et lots bornés pour la synchronisation incrémentale. Un adaptateur doit les fournir explicitement ; l’application ne les déduit pas du nom du fournisseur.

API : [SandboxLease](../../reference/sandboxlease/) · [FileTransfers](../../reference/filetransfers/).
