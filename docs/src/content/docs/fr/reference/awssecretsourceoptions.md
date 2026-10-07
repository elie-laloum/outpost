---
title: "AwsSecretSourceOptions"
description: "AwsSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AwsSecretSourceOptions } from "@elie-laloum/outpost/secrets/aws";
```

## Paramètres et propriétés

| Nom       | Type                                           | Présence | Rôle                                                                                                                                                                                                                                   |
| --------- | ---------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`  | `Pick<SecretsManagerClient, "send">`           | Requis   | Client SDK SecretsManager appartenant à l’appelant, authentifié sur l’hôte. L’adapter utilise uniquement send avec GetSecretValueCommand et transmet abortSignal ; il ne détruit jamais le client.                                     |
| `secrets` | `Readonly<Record<string, AwsSecretReference>>` | Requis   | Correspondances explicites entre identifiants de variables et identifiants ou ARN AWS avec sélecteurs de champ/version optionnels. La sélection entière est vérifiée avant lecture, et les correspondances sont copiées à la création. |

## Signature

```ts
import type { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export interface AwsSecretSourceOptions {
  readonly client: Pick<SecretsManagerClient, "send">;
  readonly secrets: Readonly<Record<string, AwsSecretReference>>;
}
```

## Contrats associés

- [AwsSecretReference](../awssecretreference/)
