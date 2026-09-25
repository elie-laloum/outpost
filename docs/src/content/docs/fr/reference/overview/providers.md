---
title: "Providers — Vue d’ensemble"
description: "Un provider est le backend qui alloue l’environnement d’exécution d’une sandbox."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un provider est le backend qui alloue l’environnement d’exécution d’une sandbox. Il fournit l’exécution des commandes, les transferts de fichiers et la libération des ressources via un bail. Les protocoles d’agents restent séparés : changer de backend ne demande pas de réécrire l’adapter d’agent.

## Fonctionnement et philosophie

Docker et Podman utilisent des conteneurs locaux, Vercel et Daytona allouent des environnements distants, et `local()` exécute explicitement sur l’hôte. Le placement détermine comment le dépôt devient accessible et comment les changements reviennent. Une configuration de provider est réutilisable ; son bail acquis représente un environnement alloué.

## Limites et responsabilités

Les capacités et garanties d’isolation dépendent du backend ; les opérations non prises en charge doivent être refusées explicitement. Firecracker et `FirecrackerOptions` décrivent un provider microVM expérimental nécessitant un hôte Linux/KVM et un invité préparés. Son icône de fiole signale un travail de recherche inachevé, pas une garantie de sécurité de production. Aucun repli silencieux vers l’exécution hôte n’est effectué.

Les API compatibles OpenAI sont des [fournisseurs de modèles](../model-providers/), distincts des backends de sandbox. `openaiCompatible()` permet des appels textuels directs expérimentaux sans Codex ; le harness d’agent est prévu en deuxième phase.

## Points d’entrée

- [docker](../../docker/)
- [podman](../../podman/)
- [local](../../local/)
- [vercel](../../vercel/)
- [daytona](../../daytona/)
- [firecracker](../../firecracker/)
- [FirecrackerOptions](../../firecrackeroptions/)
- [SandboxProvider](../../sandboxprovider/)
- [SandboxLease](../../sandboxlease/)

[Passer à la pratique avec le Guide](../../../guide/environment/providers/overview/).
