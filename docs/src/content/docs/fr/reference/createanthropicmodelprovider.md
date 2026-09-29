---
title: "createAnthropicModelProvider"
description: "createAnthropicModelProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAnthropicModelProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un fournisseur réutilisable pour l’API Anthropic Messages, avec appels d’outils, rejeu de la réflexion, streaming et cache de prompt optionnel. createAgent() refuse un modèle d’agent sans maxOutputTokens ou avec reasoning minimal. Chaque requête part une seule fois, sans retry.

[Exemple complet et règles détaillées](../../guide/model-providers/).

## Paramètres et propriétés

| Nom                        | Type                            | Présence  | Rôle                                                                                                                                                                                                  |
| -------------------------- | ------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `AnthropicModelProviderOptions` | Requis    | Clé API, URL de base, limites des requêtes et cache du prompt système. Une option inconnue échoue avec le code configuration.                                                                         |
| `options.apiKey`           | `string`                        | Requis    | Clé API Anthropic explicite envoyée dans x-api-key ; aucune session CLI ni recherche de credentials hôte.                                                                                             |
| `options.baseUrl`          | `string \| undefined`           | Optionnel | URL de base de l’API Messages avec son préfixe de version, https://api.anthropic.com/v1 par défaut ; messages y est ajouté. Identifiants, requête ou fragment échouent avec le code configuration.    |
| `options.cacheSystem`      | `boolean \| undefined`          | Optionnel | Ajoute un point de cache éphémère sur le texte système, false par défaut. Les requêtes sans instructions système échouent alors avec le code configuration ; une lecture de cache n’est pas garantie. |
| `options.timeoutMs`        | `number \| undefined`           | Optionnel | Délai de la requête en millisecondes, 120000 par défaut, au plus 2147483647. En streaming, il repart à chaque fragment reçu ; son expiration rejette avec le code timeout.                            |
| `options.maxResponseBytes` | `number \| undefined`           | Optionnel | Taille maximale du corps de réponse en octets après décompression, 8388608 (8 Mio) par défaut ; une réponse en streaming compte tous ses fragments. Au-delà, la requête échoue avec le code response. |

## Retour

`ModelProvider`

## Signature

```ts
export declare function createAnthropicModelProvider(
  options: AnthropicModelProviderOptions,
): ModelProvider;
```

## Contrats associés

- [AnthropicModelProviderOptions](../anthropicmodelprovideroptions/)
- [ModelProvider](../modelprovider/)
