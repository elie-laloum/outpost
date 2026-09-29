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

Renvoie un condensat SHA-256 hexadécimal du commit HEAD d’un dépôt, de ses modifications indexées ou non et de ses fichiers non suivis et non ignorés, hors .outpost/. Utilisez-le dans une clé de cache de tâche pour que les modifications non commitées changent la clé. Lit sans modifier ; rejette hors d’un dépôt Git.

[Exemple complet et règles détaillées](../../guide/task-cache/).

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
