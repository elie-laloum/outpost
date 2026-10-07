---
title: "AzureSecretReference"
description: "AzureSecretReference — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AzureSecretReference } from "@elie-laloum/outpost/secrets/azure";
```

## Paramètres et propriétés

| Nom       | Type                  | Présence  | Rôle                                                                                                          |
| --------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`              | Requis    | Nom du secret Key Vault avec lettres, chiffres et tirets ; peut différer de l’identifiant de la variable.     |
| `version` | `string \| undefined` | Optionnel | Chaîne optionnelle non vide de version Key Vault ; omise, laisse le service sélectionner sa dernière version. |

## Signature

```ts
export interface AzureSecretReference {
  readonly name: string;
  readonly version?: string;
}
```
