---
title: "repositoryFingerprint"
description: "repositoryFingerprint — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { repositoryFingerprint } from "@elie-laloum/outpost";
```

## Rôle et comportement

Renvoie une empreinte SHA-256 du commit HEAD d’un dépôt, des modifications suivies de l’arbre de travail, de l’index et des fichiers non suivis, hors .outpost/. Utilisez-la dans les clés de cache pour que les modifications non commitées changent la clé. Elle lit le dépôt sans le modifier et échoue hors d’un dépôt Git.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom          | Type     | Présence | Rôle                                                                                                            |
| ------------ | -------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `repository` | `string` | Requis   | Chemin d’un dépôt Git ou de l’un de ses sous-répertoires ; l’empreinte couvre toujours tout l’arbre de travail. |

## Retour

`Promise<string>`

## Signature

```ts
export declare function repositoryFingerprint(
  repository: string,
): Promise<string>;
```
