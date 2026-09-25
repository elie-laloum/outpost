---
title: "AnthropicModelProviderOptions"
description: "AnthropicModelProviderOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : requêtes texte bornées et exécution de harness fournie par l’appelant. Sans boucle d’outils intégrée, streaming ni persistance native des conversations personnalisées.
:::

## Import

```ts
import type { AnthropicModelProviderOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                   | Présence  | Rôle                                                                                                                                                      |
| ------------------ | ---------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiKey`           | `string`               | Requis    | Clé API Anthropic explicite envoyée dans x-api-key ; aucune session CLI ni recherche de credentials hôte.                                                 |
| `baseUrl`          | `string \| undefined`  | Optionnel | URL de base de Messages avec son préfixe de version ; défaut : https://api.anthropic.com/v1.                                                              |
| `cacheSystem`      | `boolean \| undefined` | Optionnel | Active un point de cache éphémère sur le texte système. Les requêtes doivent contenir des instructions système ; une lecture de cache n’est pas garantie. |
| `timeoutMs`        | `number \| undefined`  | Optionnel | Délai positif en millisecondes couvrant les en-têtes et le corps complet ; 120000 par défaut, maximum 2147483647.                                         |
| `maxResponseBytes` | `number \| undefined`  | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.         |

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
