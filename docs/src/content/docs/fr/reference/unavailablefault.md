---
title: "unavailableFault"
description: "unavailableFault — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { unavailableFault } from "@elie-laloum/outpost";
```

## Rôle et comportement

Renvoie { message } depuis details.unavailable de la première OutpostError hors quota qui le renseigne, en examinant l’erreur et jusqu’à sept causes imbriquées, sinon undefined. Les pannes conservent leur code process, provider ou timeout : testez avec cette fonction plutôt qu’avec le code. Les agents de secours qui couvrent unavailable appliquent le même test.

[Exemple complet et règles détaillées](../../guide/fallback-agents/).

## Paramètres et propriétés

| Nom     | Type      | Présence | Rôle                                                           |
| ------- | --------- | -------- | -------------------------------------------------------------- |
| `error` | `unknown` | Requis   | Toute valeur interceptée ; les causes imbriquées sont suivies. |

## Retour

`UnavailableFault | undefined`

## Signature

```ts
export declare function unavailableFault(
  error: unknown,
): UnavailableFault | undefined;
```

## Contrats associés

- [UnavailableFault](../type-unavailablefault/)
