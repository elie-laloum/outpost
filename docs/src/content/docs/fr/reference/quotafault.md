---
title: "quotaFault"
description: "quotaFault — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { quotaFault } from "@elie-laloum/outpost";
```

## Rôle et comportement

Renvoie le message et l’heure de réinitialisation d’une OutpostError de code quota, en suivant jusqu’à huit causes imbriquées. Renvoie undefined pour toute autre valeur. Utilisez-la dans retry.accepts ou la gestion d’erreurs pour distinguer les limites d’usage et de débit des autres échecs ; elle n’attend ni ne relance.

[Exemple complet et règles détaillées](../../guide/recovery/).

## Paramètres et propriétés

| Nom     | Type      | Présence | Rôle                                                                                                    |
| ------- | --------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `error` | `unknown` | Requis   | Toute valeur interceptée, généralement un rejet de dispatch, d’une tâche ou d’un fournisseur de modèle. |

## Retour

`QuotaFault | undefined`

## Signature

```ts
export declare function quotaFault(error: unknown): QuotaFault | undefined;
```

## Contrats associés

- [QuotaFault](../type-quotafault/)
