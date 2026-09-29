---
title: "CodexModelProvider"
description: "CodexModelProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexModelProvider } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                           | Présence  | Rôle                                                                                                                                                                                                  |
| ------------------- | ------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`           | `string`                       | Requis    | URL de base de l’endpoint compatible Responses : http ou https absolue, sans identifiants, requête ni fragment.                                                                                       |
| `apiKeyEnvironment` | `string \| false \| undefined` | Optionnel | Variable qui contient la clé API de l’endpoint, OPENAI_API_KEY par défaut ; l’authentification usage la renseigne. false n’envoie aucune clé et ne laisse aucune forme d’authentification disponible. |

## Signature

```ts
export interface CodexModelProvider {
  readonly baseUrl: string;
  readonly apiKeyEnvironment?: string | false;
}
```
