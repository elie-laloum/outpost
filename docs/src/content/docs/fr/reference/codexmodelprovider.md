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

| Nom                 | Type                           | Présence  | Rôle                                                                                                            |
| ------------------- | ------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------- |
| `baseUrl`           | `string`                       | Requis    | URL de base de l’endpoint de modèle personnalisé compatible Responses.                                          |
| `apiKeyEnvironment` | `string \| false \| undefined` | Optionnel | Variable d’environnement contenant la clé API de l’endpoint ; false désactive la déclaration de cette variable. |

## Signature

```ts
export interface CodexModelProvider {
  readonly baseUrl: string;
  readonly apiKeyEnvironment?: string | false;
}
```
