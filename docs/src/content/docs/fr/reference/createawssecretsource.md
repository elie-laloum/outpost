---
title: "createAwsSecretSource"
description: "createAwsSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAwsSecretSource } from "@elie-laloum/outpost/secrets/aws";
```

## Rôle et comportement

Crée un lecteur AWS Secrets Manager sur l’hôte avec un client SDK appartenant à l’appelant. Lit uniquement les correspondances sélectionnées avec GetSecretValue, conserve les sélecteurs de version et extrait éventuellement un champ propre d’un SecretString JSON. Refuse les secrets binaires et champs invalides ; transmet l’annulation au SDK. Aucune identité n’est installée dans la sandbox.

[Exemple complet et règles détaillées](../../guide/secret-sources/).

## Paramètres et propriétés

| Nom               | Type                                           | Présence | Rôle                                                                                                                                                                                                                                   |
| ----------------- | ---------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `AwsSecretSourceOptions`                       | Requis   | Client ou configuration de connexion sur l’hôte et sélection explicite des secrets pour l’adapter Aws.                                                                                                                                 |
| `options.client`  | `Pick<SecretsManagerClient, "send">`           | Requis   | Client SDK SecretsManager appartenant à l’appelant, authentifié sur l’hôte. L’adapter utilise uniquement send avec GetSecretValueCommand et transmet abortSignal ; il ne détruit jamais le client.                                     |
| `options.secrets` | `Readonly<Record<string, AwsSecretReference>>` | Requis   | Correspondances explicites entre identifiants de variables et identifiants ou ARN AWS avec sélecteurs de champ/version optionnels. La sélection entière est vérifiée avant lecture, et les correspondances sont copiées à la création. |

## Retour

`SecretSource`

## Signature

```ts
export declare function createAwsSecretSource(
  options: AwsSecretSourceOptions,
): SecretSource;
```

## Contrats associés

- [AwsSecretSourceOptions](../awssecretsourceoptions/)
- [SecretSource](../secretsource/)
