---
title: "createInfisicalSecretSource"
description: "createInfisicalSecretSource — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createInfisicalSecretSource } from "@elie-laloum/outpost/secrets/infisical";
```

## Rôle et comportement

Crée un lecteur de secrets nommés dans un projet, environnement et chemin Infisical avec un client hôte authentifié par l’appelant. Récupère uniquement les noms demandés, sans imports ni développement des références, demande explicitement les valeurs et refuse celles qui sont masquées. Ne gère ni la connexion ni le renouvellement ; l’annulation par fromSecrets termine l’attente, tandis qu’une requête SDK en cours peut terminer.

[Exemple complet et règles détaillées](../../guide/secret-sources/).

## Paramètres et propriétés

| Nom                   | Type                                                                                                                     | Présence  | Rôle                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `InfisicalSecretSourceOptions`                                                                                           | Requis    | Client ou configuration de connexion sur l’hôte et sélection explicite des secrets pour l’adapter Infisical.                                                                                                                        |
| `options.client`      | `{ secrets(): { getSecret(options: GetSecretOptions): Promise<Pick<Secret, "secretValue" \| "secretValueHidden">>; }; }` | Requis    | Client hôte authentifié par l’appelant exposant secrets().getSecret(), comme InfisicalSDK pour les instances cloud ou auto-hébergées. L’appelant choisit l’URL et l’authentification, gère le renouvellement et conserve le client. |
| `options.projectId`   | `string`                                                                                                                 | Requis    | Identifiant explicite du projet Infisical appliqué à chaque lecture de nom sélectionné.                                                                                                                                             |
| `options.environment` | `string`                                                                                                                 | Requis    | Identifiant non vide de l’environnement Infisical, comme dev ou prod, appliqué à chaque lecture sélectionnée.                                                                                                                       |
| `options.path`        | `string \| undefined`                                                                                                    | Optionnel | Chemin absolu du dossier Infisical sans traversée, / par défaut. Imports et développement des références restent désactivés indépendamment du chemin.                                                                               |

## Retour

`SecretSource`

## Signature

```ts
export declare function createInfisicalSecretSource(
  options: InfisicalSecretSourceOptions,
): SecretSource;
```

## Contrats associés

- [InfisicalSecretSourceOptions](../infisicalsecretsourceoptions/)
- [SecretSource](../secretsource/)
