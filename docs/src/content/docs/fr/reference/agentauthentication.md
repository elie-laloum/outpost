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

| Nom           | Type                                    | Présence          | Rôle                                                                                                                                                                                       |
| ------------- | --------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mode`        | `"api-key" \| "oauth-token" \| "login"` | Requis            | Mode explicite : clé API, token d’abonnement Claude ou session Codex existante. Les associations non prises en charge sont refusées localement.                                            |
| `environment` | `string \| undefined`                   | Selon la variante | Variable d’environnement contenant la clé API. Codex peut lire une variable personnalisée ; Claude et Gemini exigent leurs noms standards ANTHROPIC_API_KEY et GEMINI_API_KEY.             |
| `credentials` | `string \| undefined`                   | Selon la variante | Contenu explicite du auth.json Codex à copier dans le home du sandbox. Omettez-le uniquement si cet environnement possède déjà une session utilisable. Aucun fichier hôte n’est découvert. |

## Signature

```ts
export type AgentAuthentication =
  | {
      readonly mode: "api-key";
      readonly environment?: string;
    }
  | {
      readonly mode: "oauth-token";
    }
  | {
      readonly mode: "login";
      readonly credentials?: string;
    };
```
