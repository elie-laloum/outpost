---
title: "podman"
description: "podman — Outpost API"
sidebar:
  order: 10
---

Contrat public de **podman**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { podman } from "@elie-laloum/outpost/providers/podman";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom                      | Type                                                           | Présence  | Rôle                                                                                          |
| ------------------------ | -------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`                | `ContainerOptions \| undefined`                                | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.egress`         | `EgressPolicy \| undefined`                                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.repositoryMode` | `"mounted" \| "isolated" \| undefined`                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.caches`         | `readonly DependencyCache[] \| undefined`                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.image`          | `string \| undefined`                                          | Optionnel | Référence d’image de conteneur ou d’invité.                                                   |
| `options.user`           | `{ readonly uid: number; readonly gid: number; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.volumes`        | `readonly Volume[] \| undefined`                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                       |
| `options.networks`       | `string \| readonly string[] \| undefined`                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.groups`         | `readonly (string \| number)[] \| undefined`                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.devices`        | `readonly string[] \| undefined`                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.cpus`           | `number \| undefined`                                          | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.memoryMb`       | `number \| undefined`                                          | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.label`          | `false \| "z" \| "Z" \| undefined`                             | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.retain`         | `number \| undefined`                                          | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                      |
| `options.userns`         | `false \| "keep-id" \| undefined`                              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`import("../index.ts").SandboxProvider`

## Signature

```ts
export declare const podman: (options?: ContainerOptions) => SandboxProvider;
```

## Contrats associés

- [ContainerOptions](../containeroptions/)
