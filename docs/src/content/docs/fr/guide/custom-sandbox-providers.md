---
title: "Ajouter un provider de sandbox"
description: "Implémenter un provider de sandbox pour un autre environnement d’exécution."
---

Renvoyez un bail avec `root`, `home`, invocation, upload/download et libération idempotente. Préservez le statut de sortie après fermeture des flux, l’annulation des processus et les transferts binaires. `createMountedSandboxProvider()` et `createRemoteSandboxProvider()` aident à composer les stratégies correspondantes.

## Transferts du fournisseur

Pour implémenter un fournisseur, `SandboxLease.upload()` et `download()` transfèrent les fichiers et contenus de dossiers avec annulation et délais. Préservez les octets binaires, modes pris en charge et liens symboliques. Les transferts de conteneurs doivent voir tmpfs et les autres montages actifs.

Les capacités optionnelles `fileTransfers` proposent manifestes et lots bornés pour la synchronisation incrémentale. Un adaptateur doit les fournir explicitement ; l’application ne les déduit pas du nom du fournisseur.

API : [SandboxLease](../../reference/sandboxlease/) · [FileTransfers](../../reference/filetransfers/).
