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

Renvoie message, resetAt et conversation de la première OutpostError de code quota trouvée dans l’erreur et jusqu’à sept causes imbriquées, sinon undefined. Les agents de secours et les pauses onQuota appliquent le même test. Elle n’attend ni ne relance.

[Exemple complet et règles détaillées](../../guide/quota-pauses/).

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
