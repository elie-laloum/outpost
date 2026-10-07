---
title: "AzureSecretSourceOptions"
description: "AzureSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AzureSecretSourceOptions } from "@elie-laloum/outpost/secrets/azure";
```

## Paramètres et propriétés

| Nom       | Type                                             | Présence | Rôle                                                                                                                                                                              |
| --------- | ------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`  | `Pick<SecretClient, "getSecret">`                | Requis   | SecretClient Azure appartenant à l’appelant, avec l’URL du coffre et les identifiants hôtes choisis. Seul getSecret est utilisé, avec abortSignal ; le client reste à l’appelant. |
| `secrets` | `Readonly<Record<string, AzureSecretReference>>` | Requis   | Correspondances entre identifiants de variables, noms du coffre et versions optionnelles, copiées à la création et vérifiées pour toute la sélection avant lecture.               |

## Signature

```ts
import type { SecretClient } from "@azure/keyvault-secrets";

export interface AzureSecretSourceOptions {
  readonly client: Pick<SecretClient, "getSecret">;
  readonly secrets: Readonly<Record<string, AzureSecretReference>>;
}
```

## Contrats associés

- [AzureSecretReference](../azuresecretreference/)
