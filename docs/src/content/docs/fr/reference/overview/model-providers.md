---
title: "Model providers — Vue d’ensemble"
description: "Un fournisseur de modèles envoie les requêtes du harness intégré à une API HTTP et normalise messages, outils, raisonnement et usage."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Quel fournisseur utiliser

Passez le fournisseur à `createHarness({ modelProvider })`. Chaque fournisseur intégré parle un seul protocole et diffuse en streaming par server-sent events.

|                                  | Chat Completions                          | Responses                                         | Anthropic Messages                                                                                    |
| -------------------------------- | ----------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Fonction                         | `createOpenAIModelProvider()`             | `createOpenAIModelProvider({ api: "responses" })` | `createAnthropicModelProvider()`                                                                      |
| Chemin ajouté à `baseUrl`        | `chat/completions`                        | `responses`                                       | `messages` ; `baseUrl` vaut par défaut `https://api.anthropic.com/v1`                                 |
| `apiKey`                         | Clé bearer ou `false`                     | Clé bearer ou `false`                             | Clé envoyée dans `x-api-key`, obligatoire                                                             |
| `maxOutputTokens` de l’agent     | Facultatif                                | Facultatif                                        | Obligatoire                                                                                           |
| `reasoning` de l’agent           | Envoyé dans `reasoning_effort`            | Envoyé dans `reasoning.effort`                    | `none` désactive la réflexion ; `low` à `max` activent la réflexion adaptative ; `minimal` est refusé |
| Raisonnement conservé pour rejeu | Aucun                                     | Éléments reasoning                                | Blocs `thinking` et `redacted_thinking`                                                               |
| `isError` d’un résultat d’outil  | Non transmis                              | Non transmis                                      | Transmis dans `is_error`                                                                              |
| Cache du prompt                  | Automatique côté service ; `cache` ignoré | Automatique côté service ; `cache` ignoré         | `cache` et `cacheSystem` ajoutent des points de cache éphémères                                       |

Les blocs de raisonnement ne sont rejoués qu’à l’`identity` du fournisseur et au modèle qui les ont produits ; les autres blocs passent tels quels.

## Échec d’une requête

Chaque échec rejette avec une `OutpostError`. `unavailableFault()` reconnaît les fautes marquées indisponibles, que les [agents de secours](../../../guide/fallback-agents/) peuvent couvrir.

| Situation                                                                          | Code            | Détails                                                       |
| ---------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------- |
| Options, requête ou modèle de l’agent invalides                                    | `configuration` | —                                                             |
| HTTP 429                                                                           | `quota`         | `status` ; `retryAfterMs` et `resetAt` issus de `Retry-After` |
| HTTP 408, 500, 502, 503, 504 ou 529                                                | `provider`      | `status`, `unavailable`                                       |
| Autre statut HTTP d’erreur                                                         | `provider`      | `status`                                                      |
| Échec de connexion ou redirection                                                  | `provider`      | `unavailable`                                                 |
| Erreur de stream `rate_limit_error`, `rate_limit_exceeded` ou `insufficient_quota` | `quota`         | `type`, `code`                                                |
| Erreur de stream `overloaded_error`, `api_error` ou `server_error`                 | `provider`      | `type`, `unavailable`                                         |
| Aucune réponse en `timeoutMs` (en streaming : aucun fragment)                      | `timeout`       | —                                                             |
| `signal` de la requête annulé                                                      | `aborted`       | —                                                             |
| Réponse malformée, non prise en charge ou trop volumineuse                         | `response`      | —                                                             |

:::note
Un fournisseur envoie chaque requête une seule fois et ne change jamais de protocole. Les reprises viennent des retries de tâche, des pauses de quota ou des agents de secours.
:::

## Points d’entrée

Guide : [Fournisseurs de modèles](../../../guide/model-providers/) · [Harness intégré](../../../guide/harness/) · [Agents de secours](../../../guide/fallback-agents/)

- [createOpenAIModelProvider](../../createopenaimodelprovider/)
- [createAnthropicModelProvider](../../createanthropicmodelprovider/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)
- [ModelMessage](../../modelmessage/)
- [ModelContentBlock](../../modelcontentblock/)
- [ModelStreamEvent](../../modelstreamevent/)
- [OpenAIModelProviderOptions](../../openaimodelprovideroptions/)
- [AnthropicModelProviderOptions](../../anthropicmodelprovideroptions/)
