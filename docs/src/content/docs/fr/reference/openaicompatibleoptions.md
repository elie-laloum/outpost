---
title: "OpenAICompatibleOptions"
description: "OpenAICompatibleOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Cette première phase effectue des appels HTTP textuels sans Codex. Le harness d’agent est prévu en phase deux : l’exécution d’outils, la modification du dépôt et la persistance des conversations ne sont pas implémentées. Cette API ne peut pas servir d’agent de dispatch ni de provider de sandbox ; son contrat peut évoluer. Consultez le [périmètre implémenté et le harness prévu](../../guide/advanced/model-providers/).
:::

## Import

```ts
import type { OpenAICompatibleOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                             | Présence  | Rôle                                                                                                                                                         |
| ------------------ | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseUrl`          | `string`                                         | Requis    | URL HTTP(S) absolue de base de l’API, avec son éventuel préfixe /v1 ; sans identifiants, requête ni fragment. Le chemin du protocole choisi est ajouté.      |
| `model`            | `string`                                         | Requis    | Identifiant non vide de modèle reconnu par le service choisi ; aucun modèle par défaut n’est déduit.                                                         |
| `apiKey`           | `string \| false`                                | Requis    | Clé API bearer explicite, ou false pour un endpoint sans authentification. Aucune variable d’environnement ni connexion de compte n’est lue automatiquement. |
| `api`              | `"chat-completions" \| "responses" \| undefined` | Optionnel | Protocole HTTP : chat-completions par défaut, ou responses. Aucun repli automatique entre protocoles.                                                        |
| `timeoutMs`        | `number \| undefined`                            | Optionnel | Délai positif en millisecondes couvrant les en-têtes et le corps complet ; 120000 par défaut, maximum 2147483647.                                            |
| `maxResponseBytes` | `number \| undefined`                            | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.            |

## Signature

```ts
export interface OpenAICompatibleOptions {
  readonly baseUrl: string;
  readonly model: string;
  readonly apiKey: string | false;
  readonly api?: "chat-completions" | "responses";
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
