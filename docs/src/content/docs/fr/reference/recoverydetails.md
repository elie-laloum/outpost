---
title: "recoveryDetails"
description: "recoveryDetails — Outpost API"
sidebar:
  order: 10
---

Contrat public de **recoveryDetails**. Consultez le [guide erreurs](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { recoveryDetails } from "@elie-laloum/outpost";
```

## Rôle et comportement

Identifier les codes d’échec et chemins de récupération avant reprise ou nettoyage.

Un agent en échec lève une erreur ; une commande brute peut renvoyer un statut non nul. Préservez erreurs originales et artefacts de récupération lors du diagnostic ou de la reprise.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom     | Type      | Présence | Rôle                                                                             |
| ------- | --------- | -------- | -------------------------------------------------------------------------------- |
| `error` | `unknown` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Retour

`Readonly<Record<string, unknown>> | undefined`

## Signature

```ts
export declare function recoveryDetails(
  error: unknown,
): Readonly<Record<string, unknown>> | undefined;
```
