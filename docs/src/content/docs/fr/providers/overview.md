---
title: "Choisir un provider"
description: "Choisir un provider — Outpost"
sidebar:
  order: 1
---

Le provider détermine où les commandes s’exécutent. Il ne choisit pas l’agent et ne change pas le fonctionnement des workflows.

| Provider        | Emplacement                 | Terminal interactif | Prérequis                                                 |
| --------------- | --------------------------- | ------------------- | --------------------------------------------------------- |
| `docker()`      | Checkout monté ou isolé     | Oui                 | Moteur Docker et image générée/personnalisée              |
| `podman()`      | Checkout monté ou isolé     | Oui                 | Moteur Podman et image générée/personnalisée              |
| `local()`       | Copie de l’hôte             | Oui                 | CLI natif installé et authentifié                         |
| `vercel()`      | Copie Git distante          | Non                 | Identifiants Vercel et `@vercel/sandbox`                  |
| `daytona()`     | Copie Git distante          | Oui                 | Identifiants Daytona et `@daytona/sdk`                    |
| `firecracker()` | Copie Git privée en microVM | Non                 | Linux KVM, TAP, image invitée et SSH préparés ; recherche |

Docker est le défaut. Tous les providers intégrés prennent en charge transferts de fichiers/répertoires via le contrat lease, flux de sortie et annulation. Importez chaque provider depuis `@elie-laloum/outpost/providers/NOM`.

Choisissez Docker ou Podman pour une isolation locale avec accès rapide aux fichiers. Choisissez le cloud pour une machine distante. Utilisez `local()` uniquement pour une exécution directe voulue sur l’hôte ; un container échoué ne provoque jamais de repli silencieux vers l’hôte.

Les providers montés exposent la copie sélectionnée et les métadonnées Git partagées. Ils ne protègent pas ce dépôt d’un agent hostile. Les providers distants transfèrent les données au compte cloud choisi puis rapatrient les résultats. Lisez [les limites de sécurité](../../operations/security/) et [la synchronisation distante](../../sandboxes/remote-sync/).

La configuration est écrite en code : vous pouvez créer plusieurs instances pour plusieurs usages. Les SDK cloud optionnels sont chargés via leurs points d’entrée dédiés. L’authentification de l’agent reste distincte.

Docker/Podman montent les métadonnées Git par défaut ; le [prototype de dépôt isolé](../repository-isolation/) utilise un checkout privé synchronisé par bundles. [Firecracker](../firecracker/) est un backend de recherche nécessitant un hôte Linux préparé ; ses tests simulés ne prouvent ni un démarrage réel ni une isolation de production. Les [politiques réseau sortantes](../../sandboxes/egress/) proposent le blocage total des conteneurs et les règles du pare-feu Vercel, avec des limites propres à chaque provider.
