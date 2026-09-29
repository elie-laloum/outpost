---
title: "createOpenAIModelProvider"
description: "createOpenAIModelProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createOpenAIModelProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un fournisseur réutilisable pour un service compatible OpenAI via Chat Completions (par défaut) ou Responses, avec appels d’outils, effort de raisonnement et streaming. Des options invalides échouent avec le code configuration. Chaque requête part une seule fois, sans retry ni changement de protocole.

[Exemple complet et règles détaillées](../../guide/model-providers/).

## Paramètres et propriétés

| Nom                        | Type                                             | Présence  | Rôle                                                                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `OpenAIModelProviderOptions`                     | Requis    | URL de base, protocole, clé API et limites des requêtes. Une option inconnue échoue avec le code configuration.                                                                                                                                        |
| `options.api`              | `"chat-completions" \| "responses" \| undefined` | Optionnel | Protocole HTTP : chat-completions par défaut, ou responses. Aucun repli automatique entre protocoles.                                                                                                                                                  |
| `options.baseUrl`          | `string`                                         | Requis    | URL de base HTTP(S) absolue avec son préfixe de version, par exemple https://api.openai.com/v1 ; chat/completions ou responses y est ajouté. Identifiants, requête ou fragment échouent avec le code configuration, et les redirections sont refusées. |
| `options.apiKey`           | `string \| false`                                | Requis    | Clé API bearer explicite, ou false pour un endpoint sans authentification. Aucune variable d’environnement ni connexion de compte n’est lue automatiquement.                                                                                           |
| `options.timeoutMs`        | `number \| undefined`                            | Optionnel | Délai de la requête en millisecondes, 120000 par défaut, au plus 2147483647. En streaming, il repart à chaque fragment reçu ; son expiration rejette avec le code timeout.                                                                             |
| `options.maxResponseBytes` | `number \| undefined`                            | Optionnel | Taille maximale du corps de réponse en octets après décompression, 8388608 (8 Mio) par défaut ; une réponse en streaming compte tous ses fragments. Au-delà, la requête échoue avec le code response.                                                  |

## Retour

`ModelProvider`

## Signature

```ts
export declare function createOpenAIModelProvider(
  options: OpenAIModelProviderOptions,
): ModelProvider;
```

## Contrats associés

- [ModelProvider](../modelprovider/)
- [OpenAIModelProviderOptions](../openaimodelprovideroptions/)
