---
title: "ContainerOptions"
description: "ContainerOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ContainerOptions**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/docker";
import type { ContainerOptions } from "@elie-laloum/outpost/providers/podman";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom              | Type                                                           | Présence  | Rôle                                                                             |
| ---------------- | -------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `egress`         | `EgressPolicy \| undefined`                                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `caches`         | `readonly DependencyCache[] \| undefined`                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `image`          | `string \| undefined`                                          | Optionnel | Référence d’image de conteneur ou d’invité.                                      |
| `user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `volumes`        | `readonly Volume[] \| undefined`                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.          |
| `networks`       | `string \| readonly string[] \| undefined`                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `groups`         | `readonly (string \| number)[] \| undefined`                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `devices`        | `readonly string[] \| undefined`                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `cpus`           | `number \| undefined`                                          | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `memoryMb`       | `number \| undefined`                                          | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `label`          | `false \| "z" \| "Z" \| undefined`                             | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `retain`         | `number \| undefined`                                          | Optionnel | Taille maximale de la fin conservée par flux, en octets.                         |
| `userns`         | `false \| "keep-id" \| undefined`                              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
