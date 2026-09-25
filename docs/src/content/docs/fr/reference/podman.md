---
title: "podman"
description: "podman — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { podman } from "@elie-laloum/outpost/providers/podman";
```

## Rôle et comportement

Crée un provider Podman avec les contrats d’exécution en conteneur et de transfert par flux. userns peut conserver la correspondance d’UID hôte et label contrôle le réétiquetage SELinux des montages. Le provider n’est alloué que lors de son acquisition par une sandbox.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom                      | Type                                                           | Présence  | Rôle                                                                                                                |
| ------------------------ | -------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `options`                | `ContainerOptions \| undefined`                                | Optionnel | Image de conteneur, mode de dépôt, montages, environnement, réseau et limites de ressources.                        |
| `options.egress`         | `EgressPolicy \| undefined`                                    | Optionnel | Politique réseau sortante explicite ; le provider rejette les restrictions non prises en charge.                    |
| `options.repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optionnel | mounted partage le checkout hôte et les métadonnées Git ; isolated utilise le transfert opt-in vers un dépôt privé. |
| `options.caches`         | `readonly DependencyCache[] \| undefined`                      | Optionnel | Volumes de cache de dépendances gérés par le moteur avec une durée de vie indépendante.                             |
| `options.image`          | `string \| undefined`                                          | Optionnel | Référence d’image de conteneur ou d’invité.                                                                         |
| `options.user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optionnel | UID et GID utilisés pour les commandes et la possession des fichiers dans le conteneur.                             |
| `options.volumes`        | `readonly Volume[] \| undefined`                               | Optionnel | Montages explicites de fichiers de l’hôte vers la sandbox.                                                          |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                             |
| `options.networks`       | `string \| readonly string[] \| undefined`                     | Optionnel | Nom ou noms de réseaux du conteneur transmis au moteur.                                                             |
| `options.groups`         | `readonly (string \| number)[] \| undefined`                   | Optionnel | Noms ou identifiants de groupes supplémentaires accordés dans le conteneur.                                         |
| `options.devices`        | `readonly string[] \| undefined`                               | Optionnel | Correspondances de périphériques hôtes explicitement exposés au conteneur.                                          |
| `options.cpus`           | `number \| undefined`                                          | Optionnel | Limite d’allocation CPU de l’environnement d’exécution.                                                             |
| `options.memoryMb`       | `number \| undefined`                                          | Optionnel | Limite d’allocation mémoire en mégaoctets.                                                                          |
| `options.label`          | `false \| "z" \| "Z" \| undefined`                             | Optionnel | Réétiquetage SELinux des chemins montés : z partagé, Z privé, false désactivé.                                      |
| `options.retain`         | `number \| undefined`                                          | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                                            |
| `options.userns`         | `false \| "keep-id" \| undefined`                              | Optionnel | Mode d’espace utilisateur Podman ; keep-id conserve les identifiants hôtes et false désactive cette option.         |

## Retour

`import("../index.ts").SandboxProvider`

## Signature

```ts
export declare const podman: (options?: ContainerOptions) => SandboxProvider;
```

## Contrats associés

- [ContainerOptions](../containeroptions/)
