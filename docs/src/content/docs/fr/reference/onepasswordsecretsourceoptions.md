---
title: "OnePasswordSecretSourceOptions"
description: "OnePasswordSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OnePasswordSecretSourceOptions } from "@elie-laloum/outpost/secrets/onepassword";
```

## Paramètres et propriétés

| Nom       | Type                                                        | Présence | Rôle                                                                                                                                                                                                                               |
| --------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`  | `{ readonly secrets: Pick<Client["secrets"], "resolve">; }` | Requis   | Client hôte authentifié par l’appelant exposant secrets.resolve, comme le SDK officiel 1Password avec un compte de service. Il reste à l’appelant ; Outpost ne choisit aucune connexion de bureau ni lecture du trousseau système. |
| `secrets` | `Readonly<Record<string, string>>`                          | Requis   | Correspondances entre identifiants de variables et références explicites op://vault/item/field ou op://vault/item/section/field ; seules les correspondances sélectionnées sont résolues, sans énumérer les coffres ou éléments.   |

## Signature

```ts
import type { Client } from "@1password/sdk";

export interface OnePasswordSecretSourceOptions {
  readonly client: {
    readonly secrets: Pick<Client["secrets"], "resolve">;
  };
  readonly secrets: Readonly<Record<string, string>>;
}
```
