---
title: "createOnePasswordSecretSource"
description: "createOnePasswordSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createOnePasswordSecretSource } from "@elie-laloum/outpost/secrets/onepassword";
```

## Rôle et comportement

Crée un lecteur utilisant le client SDK 1Password authentifié de l’appelant. Résout uniquement les correspondances sélectionnées vers des références op:// explicites, valide toute la sélection avant lecture et laisse le client à l’appelant. L’annulation par fromSecrets termine l’attente, sans annuler une requête SDK en cours.

[Exemple complet et règles détaillées](../../guide/secret-sources/).

## Paramètres et propriétés

| Nom               | Type                                                        | Présence | Rôle                                                                                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `OnePasswordSecretSourceOptions`                            | Requis   | Client ou configuration de connexion sur l’hôte et sélection explicite des secrets pour l’adapter OnePassword.                                                                                                                     |
| `options.client`  | `{ readonly secrets: Pick<Client["secrets"], "resolve">; }` | Requis   | Client hôte authentifié par l’appelant exposant secrets.resolve, comme le SDK officiel 1Password avec un compte de service. Il reste à l’appelant ; Outpost ne choisit aucune connexion de bureau ni lecture du trousseau système. |
| `options.secrets` | `Readonly<Record<string, string>>`                          | Requis   | Correspondances entre identifiants de variables et références explicites op://vault/item/field ou op://vault/item/section/field ; seules les correspondances sélectionnées sont résolues, sans énumérer les coffres ou éléments.   |

## Retour

`SecretSource`

## Signature

```ts
export declare function createOnePasswordSecretSource(
  options: OnePasswordSecretSourceOptions,
): SecretSource;
```

## Contrats associés

- [OnePasswordSecretSourceOptions](../onepasswordsecretsourceoptions/)
- [SecretSource](../secretsource/)
