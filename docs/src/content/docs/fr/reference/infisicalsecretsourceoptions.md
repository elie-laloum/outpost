---
title: "InfisicalSecretSourceOptions"
description: "InfisicalSecretSourceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { InfisicalSecretSourceOptions } from "@elie-laloum/outpost/secrets/infisical";
```

## Paramètres et propriétés

| Nom           | Type                                                                                                                     | Présence  | Rôle                                                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`      | `{ secrets(): { getSecret(options: GetSecretOptions): Promise<Pick<Secret, "secretValue" \| "secretValueHidden">>; }; }` | Requis    | Client hôte authentifié par l’appelant exposant secrets().getSecret(), comme InfisicalSDK pour les instances cloud ou auto-hébergées. L’appelant choisit l’URL et l’authentification, gère le renouvellement et conserve le client. |
| `projectId`   | `string`                                                                                                                 | Requis    | Identifiant explicite du projet Infisical appliqué à chaque lecture de nom sélectionné.                                                                                                                                             |
| `environment` | `string`                                                                                                                 | Requis    | Identifiant non vide de l’environnement Infisical, comme dev ou prod, appliqué à chaque lecture sélectionnée.                                                                                                                       |
| `path`        | `string \| undefined`                                                                                                    | Optionnel | Chemin absolu du dossier Infisical sans traversée, / par défaut. Imports et développement des références restent désactivés indépendamment du chemin.                                                                               |

## Signature

```ts
import type { GetSecretOptions, Secret } from "@infisical/sdk";

export interface InfisicalSecretSourceOptions {
  readonly client: {
    secrets(): {
      getSecret(
        options: GetSecretOptions,
      ): Promise<Pick<Secret, "secretValue" | "secretValueHidden">>;
    };
  };
  readonly projectId: string;
  readonly environment: string;
  readonly path?: string;
}
```
