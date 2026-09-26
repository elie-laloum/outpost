---
title: "anthropicModelProvider"
description: "anthropicModelProvider — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer dans une version ultérieure.
:::

## Import

```ts
import { anthropicModelProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configure un transport Anthropic Messages avec messages, appels d’outils, rejeu de la réflexion, streaming optionnel et cache optionnel du préfixe système et de l’historique. Le harness fournit le modèle par requête ; le modèle de l’agent doit fixer maxOutputTokens, et le raisonnement se traduit en réflexion adaptative ou désactivée. Les lectures et écritures de cache sont normalisées dans l’usage ; les outils serveur sont refusés.

[Exemple complet et règles détaillées](../../guide/advanced/model-providers/).

## Paramètres et propriétés

| Nom                        | Type                            | Présence  | Rôle                                                                                                                                                       |
| -------------------------- | ------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `AnthropicModelProviderOptions` | Requis    | Endpoint Anthropic, clé API explicite, limites de transport et cache optionnel du préfixe système ; la limite de sortie appartient au modèle de l’agent.   |
| `options.apiKey`           | `string`                        | Requis    | Clé API Anthropic explicite envoyée dans x-api-key ; aucune session CLI ni recherche de credentials hôte.                                                  |
| `options.baseUrl`          | `string \| undefined`           | Optionnel | URL de base de Messages avec son préfixe de version ; défaut : https://api.anthropic.com/v1.                                                               |
| `options.cacheSystem`      | `boolean \| undefined`          | Optionnel | Active un point de cache éphémère sur le texte système. Les requêtes doivent contenir des instructions système ; une lecture de cache n’est pas garantie.  |
| `options.timeoutMs`        | `number \| undefined`           | Optionnel | Délai positif en millisecondes ; 120000 par défaut, sans dépasser 2147483647. Il couvre toute la requête, ou le silence entre deux fragments en streaming. |
| `options.maxResponseBytes` | `number \| undefined`           | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.          |

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
