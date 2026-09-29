---
title: "Choisir une sandbox"
description: "Choisir où les commandes de l’agent s’exécutent."
---

Un fournisseur de sandbox alloue un environnement, exécute des commandes, transfère des fichiers et libère ses ressources. Choisissez-le indépendamment du harness de l’agent.

| Environnement                          | Accès au dépôt                        | Terminal interactif | Préparation                         |
| -------------------------------------- | ------------------------------------- | ------------------- | ----------------------------------- |
| [Docker](../containers/)               | Montages hôte par défaut              | Oui                 | Moteur Docker et image              |
| [Podman](../containers/)               | Montages hôte par défaut              | Oui                 | Moteur Podman et image              |
| [Processus hôte](../host-process/)     | Système de fichiers hôte direct       | Oui                 | Outils installés ; aucune isolation |
| [Vercel Sandbox](../cloud-sandboxes/)  | Snapshot téléversé et synchronisation | Non                 | SDK optionnel et identifiants cloud |
| [Daytona Sandbox](../cloud-sandboxes/) | Snapshot téléversé et synchronisation | Oui                 | SDK optionnel et identifiants cloud |
| [VM Firecracker](../firecracker/)      | Environnement invité privé            | Selon les capacités | Hôte Linux/KVM et invité préparés   |

## Choisir selon la propriété

Utilisez un conteneur pour un environnement reproductible en local ou en CI. Choisissez le cloud pour allouer hors de l’hôte. Utilisez l’exécution locale uniquement lorsque l’accès à l’hôte est volontaire.

Les montages de conteneurs exposent le checkout sélectionné et les métadonnées Git. L’[isolation Git privée](../private-git/) est une alternative explicite avec une synchronisation différente.

La synchronisation cloud s’arrête si elle risque d’écraser des modifications concurrentes de l’hôte. Outpost conserve les données de récupération au lieu de choisir silencieusement une version. Voir [Échange de fichiers](../cloud-sandboxes/).

API : [SandboxProvider](../../reference/sandboxprovider/).
