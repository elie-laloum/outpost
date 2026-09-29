---
title: "Providers — Vue d’ensemble"
description: "Les providers de sandbox allouent l’endroit où s’exécutent les commandes de l’agent : conteneur, sandbox hébergée, microVM ou hôte."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Quel provider choisir

Passez un provider dans `sandboxProvider` ; sans lui, Outpost utilise Docker. Rien ne se replie sur l’hôte : un moteur, un SDK, un identifiant ou KVM manquant fait échouer l’acquisition.

| Provider                                                         | Isolation                           | Les commandes s’exécutent dans              | Dépôt                                                    | Entrée en direct               |
| ---------------------------------------------------------------- | ----------------------------------- | ------------------------------------------- | -------------------------------------------------------- | ------------------------------ |
| `createDockerSandboxProvider()`, `createPodmanSandboxProvider()` | Conteneur                           | Un conteneur de votre moteur local          | Worktree et métadonnées Git montés (`mounted`)           | Oui                            |
| Idem, avec `repositoryMode: "isolated"`                          | Conteneur, dépôt hôte non monté     | Un conteneur de votre moteur local          | Historique envoyé, changements resynchronisés (`remote`) | Oui                            |
| `createVercelSandboxProvider()`                                  | Sandbox hébergée                    | Une Vercel Sandbox                          | Historique envoyé, changements resynchronisés (`remote`) | Oui                            |
| `createDaytonaSandboxProvider()`                                 | Sandbox hébergée                    | Une sandbox Daytona                         | Historique envoyé, changements resynchronisés (`remote`) | Oui                            |
| `createFirecrackerSandboxProvider()`                             | MicroVM avec son propre noyau       | Un invité sur votre hôte Linux KVM, via SSH | Historique envoyé, changements resynchronisés (`remote`) | Oui                            |
| `createLocalSandboxProvider()`                                   | Aucune                              | Des processus hôtes, dans le worktree       | Worktree hôte utilisé sur place (`host`)                 | Oui                            |
| `createMountedSandboxProvider(definition)`                       | Celle que fournit votre `acquire()` | Votre environnement                         | Votre `acquire()` monte le worktree (`mounted`)          | Si le bail définit `liveInput` |
| `createRemoteSandboxProvider(definition)`                        | Celle que fournit votre `acquire()` | Votre environnement                         | Historique envoyé, changements resynchronisés (`remote`) | Si le bail définit `liveInput` |

:::caution
`createLocalSandboxProvider()` exécute l’agent avec les fichiers, l’environnement et les identifiants de votre utilisateur. Un conteneur monté peut écrire dans les métadonnées Git du dépôt : il ne protège pas d’un agent hostile.
:::

## Quelles règles egress s’appliquent

Définissez `egress` dans les options du provider. Un provider qui ne peut pas imposer une règle demandée la refuse avec le code `configuration` dès sa création.

| Provider           | `deny-all` | `domains`                                 | `allowCidrs`                    | `denyCidrs` | Appliquée par                                        |
| ------------------ | ---------- | ----------------------------------------- | ------------------------------- | ----------- | ---------------------------------------------------- |
| Docker, Podman     | Oui        | Non                                       | Non                             | Non         | Le réseau `none`                                     |
| Vercel             | Oui        | Oui                                       | IPv4 et IPv6                    | Oui         | Le pare-feu Vercel, domaines filtrés par SNI TLS     |
| Daytona            | Oui        | Jusqu’à 100 ; listez la racine d’un joker | Jusqu’à 10 IPv4, sans `domains` | Non         | Daytona, confirmée avant la préparation du workspace |
| Local, Firecracker | Non        | Non                                       | Non                             | Non         | —                                                    |

Si Daytona refuse la confirmation, l’acquisition échoue avec le code `provider` et la sandbox est supprimée. L’egress ne couvre que la sandbox : les requêtes de modèle du harness, les téléchargements d’images et les transferts de fichiers partent de l’hôte.

## Points d’entrée

Guide : [Choisir une sandbox](../../../guide/choose-a-sandbox/) · [Restrictions réseau](../../../guide/network-restrictions/) · [Ajouter un provider de sandbox](../../../guide/custom-sandbox-providers/)

- [createDockerSandboxProvider](../../createdockersandboxprovider/)
- [createPodmanSandboxProvider](../../createpodmansandboxprovider/)
- [createVercelSandboxProvider](../../createvercelsandboxprovider/)
- [createDaytonaSandboxProvider](../../createdaytonasandboxprovider/)
- [createFirecrackerSandboxProvider](../../createfirecrackersandboxprovider/)
- [createLocalSandboxProvider](../../createlocalsandboxprovider/)
- [createRemoteSandboxProvider](../../createremotesandboxprovider/)
- [createMountedSandboxProvider](../../createmountedsandboxprovider/)
- [SandboxProvider](../../sandboxprovider/)
- [SandboxLease](../../sandboxlease/)
- [ContainerOptions](../../containeroptions/)
- [EgressPolicy](../../egresspolicy/)
