---
title: "createAzureSecretSource"
description: "createAzureSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAzureSecretSource } from "@elie-laloum/outpost/secrets/azure";
```

## Rôle et comportement

Crée un lecteur Azure Key Vault avec le client SDK et les identifiants hôtes de l’appelant. Associe les variables sélectionnées aux noms du coffre et versions optionnelles, transmet l’annulation à getSecret et renvoie les valeurs textuelles. L’appelant possède le client et choisit le coffre.

[Exemple complet et règles détaillées](../../guide/secret-sources/).

## Paramètres et propriétés

| Nom               | Type                                             | Présence | Rôle                                                                                                                                                                              |
| ----------------- | ------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `AzureSecretSourceOptions`                       | Requis   | Client ou configuration de connexion sur l’hôte et sélection explicite des secrets pour l’adapter Azure.                                                                          |
| `options.client`  | `Pick<SecretClient, "getSecret">`                | Requis   | SecretClient Azure appartenant à l’appelant, avec l’URL du coffre et les identifiants hôtes choisis. Seul getSecret est utilisé, avec abortSignal ; le client reste à l’appelant. |
| `options.secrets` | `Readonly<Record<string, AzureSecretReference>>` | Requis   | Correspondances entre identifiants de variables, noms du coffre et versions optionnelles, copiées à la création et vérifiées pour toute la sélection avant lecture.               |

## Retour

`SecretSource`

## Signature

```ts
export declare function createAzureSecretSource(
  options: AzureSecretSourceOptions,
): SecretSource;
```

## Contrats associés

- [AzureSecretSourceOptions](../azuresecretsourceoptions/)
- [SecretSource](../secretsource/)
