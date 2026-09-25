---
title: "recoveryDetails"
description: "recoveryDetails — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoveryDetails } from "@elie-laloum/outpost";
```

## Rôle et comportement

Extrait les métadonnées de récupération d’une erreur inconnue lorsqu’Outpost les a attachées. Le résultat identifie le travail et les emplacements conservés ; sans métadonnées, renvoie undefined sans déclencher de nettoyage ni de restauration.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom     | Type      | Présence | Rôle                                                                         |
| ------- | --------- | -------- | ---------------------------------------------------------------------------- |
| `error` | `unknown` | Requis   | Valeur levée inconnue dont extraire les métadonnées de récupération Outpost. |

## Retour

`Readonly<Record<string, unknown>> | undefined`

## Signature

```ts
export declare function recoveryDetails(
  error: unknown,
): Readonly<Record<string, unknown>> | undefined;
```
