---
title: "AnthropicModelProviderOptions"
description: "AnthropicModelProviderOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AnthropicModelProviderOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                   | Présence  | Rôle                                                                                                                                                                                                  |
| ------------------ | ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiKey`           | `string`               | Requis    | Clé API Anthropic explicite envoyée dans x-api-key ; aucune session CLI ni recherche de credentials hôte.                                                                                             |
| `baseUrl`          | `string \| undefined`  | Optionnel | URL de base de l’API Messages avec son préfixe de version, https://api.anthropic.com/v1 par défaut ; messages y est ajouté. Identifiants, requête ou fragment échouent avec le code configuration.    |
| `cacheSystem`      | `boolean \| undefined` | Optionnel | Ajoute un point de cache éphémère sur le texte système, false par défaut. Les requêtes sans instructions système échouent alors avec le code configuration ; une lecture de cache n’est pas garantie. |
| `timeoutMs`        | `number \| undefined`  | Optionnel | Délai de la requête en millisecondes, 120000 par défaut, au plus 2147483647. En streaming, il repart à chaque fragment reçu ; son expiration rejette avec le code timeout.                            |
| `maxResponseBytes` | `number \| undefined`  | Optionnel | Taille maximale du corps de réponse en octets après décompression, 8388608 (8 Mio) par défaut ; une réponse en streaming compte tous ses fragments. Au-delà, la requête échoue avec le code response. |

## Signature

```ts
export interface AnthropicModelProviderOptions {
  readonly apiKey: string;
  readonly baseUrl?: string;
  readonly cacheSystem?: boolean;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
