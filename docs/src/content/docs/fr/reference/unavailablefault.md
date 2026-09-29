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

Renvoie le signal de panne d’une erreur Outpost marquée indisponible par un adapter CLI ou un fournisseur de modèle, en suivant jusqu’à huit causes imbriquées. Les erreurs de quota et toute autre valeur renvoient undefined. Les pannes conservent leur code process ou provider : utilisez cette fonction plutôt que le code pour les reconnaître ; elle n’attend ni ne relance.

[Exemple complet et règles détaillées](../../guide/recovery/).

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
