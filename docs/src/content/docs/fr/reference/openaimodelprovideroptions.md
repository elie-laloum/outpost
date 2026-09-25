---
title: "OpenAIModelProviderOptions"
description: "OpenAIModelProviderOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : requêtes texte bornées et exécution de harness fournie par l’appelant. Sans boucle d’outils intégrée, streaming ni persistance native des conversations personnalisées.
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
| `timeoutMs`        | `number \| undefined`                            | Optionnel | Délai positif en millisecondes couvrant les en-têtes et le corps complet ; 120000 par défaut, maximum 2147483647.                                            |
| `maxResponseBytes` | `number \| undefined`                            | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.            |

## Signature

```ts
export interface OpenAIModelProviderOptions extends HttpModelOptions {
  readonly api?: "chat-completions" | "responses";
}
```

## Contrats associés

- [HttpModelOptions](../support-httpmodeloptions/)
