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

Renvoie l’enregistrement de récupération qu’Outpost a attaché à une valeur levée : l’emplacement du travail conservé, par exemple branch, directory, commits, transcript, logReference ou conversation. Fonctionne sur tout objet levé, y compris une Error simple ou une raison d’annulation. Renvoie un objet vide pour une OutpostError sans enregistrement et undefined pour toute autre valeur sans enregistrement.

[Exemple complet et règles détaillées](../../guide/error-handling/).

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
