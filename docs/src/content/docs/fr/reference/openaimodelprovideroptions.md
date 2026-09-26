---
title: "OpenAIModelProviderOptions"
description: "OpenAIModelProviderOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer avant publication.
:::

## Import

```ts
import type { OpenAIModelProviderOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                             | Présence  | Rôle                                                                                                                                                         |
| ------------------ | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api`              | `"chat-completions" \| "responses" \| undefined` | Optionnel | Protocole HTTP : chat-completions par défaut, ou responses. Aucun repli automatique entre protocoles.                                                        |
| `baseUrl`          | `string`                                         | Requis    | URL HTTP(S) absolue de base de l’API, avec son éventuel préfixe /v1 ; sans identifiants, requête ni fragment. Le chemin du protocole choisi est ajouté.      |
| `apiKey`           | `string \| false`                                | Requis    | Clé API bearer explicite, ou false pour un endpoint sans authentification. Aucune variable d’environnement ni connexion de compte n’est lue automatiquement. |
| `timeoutMs`        | `number \| undefined`                            | Optionnel | Délai positif en millisecondes ; 120000 par défaut, sans dépasser 2147483647. Il couvre toute la requête, ou le silence entre deux fragments en streaming.   |
| `maxResponseBytes` | `number \| undefined`                            | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.            |

## Signature

```ts
export interface OpenAIModelProviderOptions extends HttpModelOptions {
  readonly api?: "chat-completions" | "responses";
}
```

## Contrats associés

- [HttpModelOptions](../support-httpmodeloptions/)
