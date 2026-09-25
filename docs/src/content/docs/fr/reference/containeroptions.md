---
title: "ContainerOptions"
description: "ContainerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/docker";
import type { ContainerOptions } from "@elie-laloum/outpost/providers/podman";
```

## Paramètres et propriétés

| Nom              | Type                                                           | Présence  | Rôle                                                                                                                |
| ---------------- | -------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `egress`         | `EgressPolicy \| undefined`                                    | Optionnel | Politique réseau sortante explicite ; le provider rejette les restrictions non prises en charge.                    |
| `repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optionnel | mounted partage le checkout hôte et les métadonnées Git ; isolated utilise le transfert opt-in vers un dépôt privé. |
| `caches`         | `readonly DependencyCache[] \| undefined`                      | Optionnel | Volumes de cache de dépendances gérés par le moteur avec une durée de vie indépendante.                             |
| `image`          | `string \| undefined`                                          | Optionnel | Référence d’image de conteneur ou d’invité.                                                                         |
| `user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optionnel | UID et GID utilisés pour les commandes et la possession des fichiers dans le conteneur.                             |
| `volumes`        | `readonly Volume[] \| undefined`                               | Optionnel | Montages explicites de fichiers de l’hôte vers la sandbox.                                                          |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                             |
| `networks`       | `string \| readonly string[] \| undefined`                     | Optionnel | Nom ou noms de réseaux du conteneur transmis au moteur.                                                             |
| `groups`         | `readonly (string \| number)[] \| undefined`                   | Optionnel | Noms ou identifiants de groupes supplémentaires accordés dans le conteneur.                                         |
| `devices`        | `readonly string[] \| undefined`                               | Optionnel | Correspondances de périphériques hôtes explicitement exposés au conteneur.                                          |
| `cpus`           | `number \| undefined`                                          | Optionnel | Limite d’allocation CPU de l’environnement d’exécution.                                                             |
| `memoryMb`       | `number \| undefined`                                          | Optionnel | Limite d’allocation mémoire en mégaoctets.                                                                          |
| `label`          | `false \| "z" \| "Z" \| undefined`                             | Optionnel | Réétiquetage SELinux des chemins montés : z partagé, Z privé, false désactivé.                                      |
| `retain`         | `number \| undefined`                                          | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                                            |
| `userns`         | `false \| "keep-id" \| undefined`                              | Optionnel | Mode d’espace utilisateur Podman ; keep-id conserve les identifiants hôtes et false désactive cette option.         |

## Signature

```ts
export interface ContainerOptions {
  readonly egress?: EgressPolicy;
  readonly repositoryMode?: "mounted" | "isolated";
  readonly caches?: readonly DependencyCache[];
  readonly image?: string;
  readonly user?: {
    readonly uid: number;
    readonly gid: number;
  };
  readonly volumes?: readonly Volume[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly retain?: number;
  readonly userns?: "keep-id" | false;
}
```

## Contrats associés

- [DependencyCache](../dependencycache/)
- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
- [Volume](../volume/)
