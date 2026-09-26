---
title: "openaiModelProvider"
description: "openaiModelProvider — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer avant publication.
:::

## Import

```ts
import { openaiModelProvider } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configure un transport de requêtes réutilisable utilisant Chat Completions ou Responses, avec messages, appels d’outils, effort de raisonnement et streaming optionnel. Le harness fournit le modèle à chaque requête. La construction valide localement ; les requêtes appliquent annulation, taille et délais sans retry ni changement de protocole.

[Exemple complet et règles détaillées](../../guide/advanced/model-providers/).

## Paramètres et propriétés

| Nom                        | Type                                             | Présence  | Rôle                                                                                                                                                         |
| -------------------------- | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `OpenAIModelProviderOptions`                     | Requis    | Service HTTP, protocole, credentials explicites et limites ; le harness fournit le modèle à chaque requête.                                                  |
| `options.api`              | `"chat-completions" \| "responses" \| undefined` | Optionnel | Protocole HTTP : chat-completions par défaut, ou responses. Aucun repli automatique entre protocoles.                                                        |
| `options.baseUrl`          | `string`                                         | Requis    | URL HTTP(S) absolue de base de l’API, avec son éventuel préfixe /v1 ; sans identifiants, requête ni fragment. Le chemin du protocole choisi est ajouté.      |
| `options.apiKey`           | `string \| false`                                | Requis    | Clé API bearer explicite, ou false pour un endpoint sans authentification. Aucune variable d’environnement ni connexion de compte n’est lue automatiquement. |
| `options.timeoutMs`        | `number \| undefined`                            | Optionnel | Délai positif en millisecondes ; 120000 par défaut, sans dépasser 2147483647. Il couvre toute la requête, ou le silence entre deux fragments en streaming.   |
| `options.maxResponseBytes` | `number \| undefined`                            | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.            |

## Retour

`ModelProvider`

## Signature

```ts
export declare function openaiModelProvider(
  options: OpenAIModelProviderOptions,
): ModelProvider;
```

## Contrats associés

- [ModelProvider](../modelprovider/)
- [OpenAIModelProviderOptions](../openaimodelprovideroptions/)
