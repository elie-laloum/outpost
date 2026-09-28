---
title: "QuotaFault"
description: "QuotaFault — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QuotaFault } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                                                               |
| -------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `message`      | `string`              | Requis    | Message de l’erreur de quota, adapté aux journaux et aux enregistrements de pause.                                 |
| `resetAt`      | `string \| undefined` | Optionnel | Horodatage ISO de réinitialisation valide porté par les détails de l’erreur ; absent s’il est inconnu ou invalide. |
| `conversation` | `string \| undefined` | Optionnel | Conversation d’agent signalée avec l’erreur de quota ; sa reprise dépend de sa capture.                            |

## Signature

```ts
export interface QuotaFault {
  readonly message: string;
  /** ISO timestamp when the provider reported that the limit resets. */
  readonly resetAt?: string;
  /** Agent conversation interrupted by the limit, when the CLI reported one. */
  readonly conversation?: string;
}
```
