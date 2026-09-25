---
title: "anthropicModelProvider"
description: "anthropicModelProvider — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : requêtes texte bornées et exécution de harness fournie par l’appelant. Sans boucle d’outils intégrée, streaming ni persistance native des conversations personnalisées.
:::

## Import

```ts
import { anthropicModelProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configure un transport texte Anthropic Messages avec limite de sortie explicite et cache optionnel du préfixe système. Le harness fournit le modèle par requête. Les lectures et écritures de cache sont normalisées dans l’usage ; outils, streaming et réponses incomplètes sont refusés.

[Exemple complet et règles détaillées](../../guide/advanced/model-providers/).

## Paramètres et propriétés

| Nom                        | Type                            | Présence  | Rôle                                                                                                                                                      |
| -------------------------- | ------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `AnthropicModelProviderOptions` | Requis    | Endpoint Anthropic, clé API explicite, limite de sortie par défaut et cache optionnel du préfixe système.                                                 |
| `options.apiKey`           | `string`                        | Requis    | Clé API Anthropic explicite envoyée dans x-api-key ; aucune session CLI ni recherche de credentials hôte.                                                 |
| `options.baseUrl`          | `string \| undefined`           | Optionnel | URL de base de Messages avec son préfixe de version ; défaut : https://api.anthropic.com/v1.                                                              |
| `options.maxOutputTokens`  | `number`                        | Requis    | Limite positive de tokens de sortie par défaut requise ; chaque requête peut la remplacer.                                                                |
| `options.cacheSystem`      | `boolean \| undefined`          | Optionnel | Active un point de cache éphémère sur le texte système. Les requêtes doivent contenir des instructions système ; une lecture de cache n’est pas garantie. |
| `options.timeoutMs`        | `number \| undefined`           | Optionnel | Délai positif en millisecondes couvrant les en-têtes et le corps complet ; 120000 par défaut, maximum 2147483647.                                         |
| `options.maxResponseBytes` | `number \| undefined`           | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.         |

## Retour

`ModelProvider`

## Signature

```ts
export declare function anthropicModelProvider(
  options: AnthropicModelProviderOptions,
): ModelProvider;
```

## Contrats associés

- [AnthropicModelProviderOptions](../anthropicmodelprovideroptions/)
- [ModelProvider](../modelprovider/)
