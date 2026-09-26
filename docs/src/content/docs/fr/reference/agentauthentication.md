---
title: "AgentAuthentication"
description: "AgentAuthentication — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentAuthentication } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type                | Présence          | Rôle                                                                                                                                                            |
| --------- | ------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `account` | `AccountCredential` | Selon la variante | Credentials d’abonnement ou de forfait : fichier ou dossier de profil sur l’hôte (file), jeton littéral (key) ou variable contenant le jeton (variable).        |
| `usage`   | `UsageCredential`   | Selon la variante | Credentials facturés à l’usage de l’API : clé littérale (key) ou variable qui la contient (variable), transmise dans la variable de clé API standard de la CLI. |

## Signature

```ts
export type AgentAuthentication =
  | "account"
  | "usage"
  | {
      readonly account: AccountCredential;
    }
  | {
      readonly usage: UsageCredential;
    };
```

## Contrats associés

- [AccountCredential](../accountcredential/)
- [UsageCredential](../usagecredential/)
