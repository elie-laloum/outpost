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

| Nom            | Type                  | Présence  | Rôle                                                                                                                                                             |
| -------------- | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message`      | `string`              | Requis    | Message de l’erreur de quota, adapté aux journaux et aux enregistrements de pause.                                                                               |
| `resetAt`      | `string \| undefined` | Optionnel | Horodatage ISO de réinitialisation valide porté par les détails de l’erreur ; absent s’il est inconnu ou invalide.                                               |
| `conversation` | `string \| undefined` | Optionnel | Identifiant de conversation du tour d’agent interrompu par la limite, lorsque les détails de l’erreur en portent un. Sa reprise exige une conversation capturée. |

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
