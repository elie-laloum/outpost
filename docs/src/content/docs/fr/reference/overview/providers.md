---
title: "Providers — Vue d’ensemble"
description: "Un provider est le backend qui alloue l’environnement d’exécution d’une sandbox."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un provider est le backend qui alloue l’environnement d’exécution d’une sandbox. Il fournit l’exécution des commandes, les transferts de fichiers et la libération des ressources via un bail. Les protocoles d’agents restent séparés : changer de backend ne demande pas de réécrire l’adapter d’agent.

## Fonctionnement et philosophie

Docker et Podman utilisent des conteneurs locaux, Vercel et Daytona allouent des environnements distants, et `localSandboxProvider()` exécute explicitement sur l’hôte. Le placement détermine comment le dépôt devient accessible et comment les changements reviennent. Une configuration de provider est réutilisable ; son bail acquis représente un environnement alloué.

`SandboxLease.fileTransfers` expose les capacités optionnelles de transfert via `FileTransfers` ; `FileManifestEntry` décrit les fichiers utilisés pour la comparaison et la vérification. Les providers peuvent proposer la réutilisation incrémentale des contenus et des lots bornés. La synchronisation du dépôt combine ces capacités avec l’historique Git et les contrôles de l’état hôte. Le [guide des transferts distants](../../../guide/operations/remote-transfers/) détaille leur utilisation.

## Limites et responsabilités

Les capacités et garanties d’isolation dépendent du backend ; les opérations non prises en charge doivent être refusées explicitement. Firecracker et `FirecrackerOptions` décrivent un provider microVM expérimental nécessitant un hôte Linux/KVM et un invité préparés. Son icône de fiole signale un travail de recherche inachevé, pas une garantie de sécurité de production. Aucun repli silencieux vers l’exécution hôte n’est effectué.

Les API compatibles OpenAI sont des [fournisseurs de modèles](../model-providers/), distincts des backends de sandbox. `openaiModelProvider()` permet des appels textuels directs expérimentaux sans Codex ; le harness d’agent est prévu en deuxième phase.

`EgressPolicy` configure l’accès au réseau sortant indépendamment des prompts de l’agent. Le provider valide et applique les restrictions demandées lors de la préparation de l’environnement. Ces capacités de recherche optionnelles dépendent du backend ; les politiques non prises en charge sont refusées explicitement. Les contrôles réseau ne remplacent ni l’isolation du dépôt ni la limitation des identifiants transmis. Le [guide du réseau sortant](../../../guide/advanced/egress/) détaille les modes pris en charge et leur vérification.

Les transferts doivent préserver les contenus binaires et les propriétés de fichiers prises en charge. Un digest vérifie l’intégrité, pas l’identité du fournisseur des données. Les changements entrants ne doivent pas écraser silencieusement les modifications hôtes concurrentes ; conflits et synchronisations interrompues peuvent conserver des données de récupération à examiner.

## Points d’entrée

- [docker](../../docker/)
- [podman](../../podman/)
- [local](../../local/)
- [vercel](../../vercel/)
- [daytona](../../daytona/)
- [firecracker](../../firecracker/)
- [FirecrackerOptions](../../firecrackeroptions/)
- [EgressPolicy](../../egresspolicy/)
- [SandboxProvider](../../sandboxprovider/)
- [SandboxLease](../../sandboxlease/)
- [TransferOptions](../../transferoptions/)
- [FileTransfers](../../filetransfers/)
- [FileManifestEntry](../../filemanifestentry/)

[Passer à la pratique avec le Guide](../../../guide/environment/providers/overview/).
