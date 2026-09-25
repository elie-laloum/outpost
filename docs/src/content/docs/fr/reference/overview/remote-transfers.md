---
title: "Transferts distants — Vue d’ensemble"
description: "Les transferts distants déplacent les données du dépôt et les fichiers explicites entre l’hôte et l’environnement d’exécution."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Les transferts distants déplacent les données du dépôt et les fichiers explicites entre l’hôte et l’environnement d’exécution. Leurs contrats décrivent octets, chemins et manifestes pour que la synchronisation sache ce qui a été transféré, sans assimiler une sandbox distante à un dossier local partagé.

## Fonctionnement et philosophie

`FileTransfers` expose les capacités de transfert ; `FileManifestEntry` décrit les entrées utilisées pour la comparaison et la vérification. Les providers peuvent proposer la réutilisation incrémentale des contenus et des lots bornés. La synchronisation du dépôt combine ces capacités avec l’historique Git et les contrôles de l’état hôte.

## Limites et responsabilités

Préservez les contenus binaires et les propriétés de fichiers prises en charge. Un digest vérifie l’intégrité, pas l’identité du fournisseur des données. Les changements entrants ne doivent pas écraser silencieusement les modifications hôtes concurrentes ; conflits et synchronisations interrompues peuvent conserver des données de récupération à examiner.

## Points d’entrée

- [FileTransfers](../../filetransfers/)
- [FileManifestEntry](../../filemanifestentry/)

[Passer à la pratique avec le Guide](../../../guide/operations/remote-transfers/).
