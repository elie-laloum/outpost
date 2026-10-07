---
title: "AwsSecretReference"
description: "AwsSecretReference — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AwsSecretReference } from "@elie-laloum/outpost/secrets/aws";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                                                                                                                                                                    |
| -------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `string`              | Requis    | Nom ou ARN exact du secret Secrets Manager transmis comme SecretId.                                                                                                                                                     |
| `field`        | `string \| undefined` | Optionnel | Champ JSON propre de premier niveau à extraire du SecretString. Sans lui, utilise toute la valeur textuelle. Le secret contenant le champ reste récupéré ; tableaux, champs absents et valeurs non textuelles échouent. |
| `versionId`    | `string \| undefined` | Optionnel | Identifiant optionnel de version AWS immuable transmis comme VersionId ; avec versionStage, les deux doivent désigner la même version.                                                                                  |
| `versionStage` | `string \| undefined` | Optionnel | Libellé optionnel de version AWS transmis comme VersionStage ; le service utilise AWSCURRENT si aucun sélecteur n’est fourni.                                                                                           |

## Signature

```ts
export interface AwsSecretReference {
  readonly id: string;
  readonly field?: string;
  readonly versionId?: string;
  readonly versionStage?: string;
}
```
