---
title: "openaiCompatible"
description: "openaiCompatible — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Cette première phase effectue des appels HTTP textuels sans Codex. Le harness d’agent est prévu en phase deux : l’exécution d’outils, la modification du dépôt et la persistance des conversations ne sont pas implémentées. Cette API ne peut pas servir d’agent de dispatch ni de provider de sandbox ; son contrat peut évoluer. Consultez le [périmètre implémenté et le harness prévu](../../guide/advanced/model-providers/).
:::

## Import

```ts
import { openaiCompatible } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un client de modèles expérimental réutilisable qui envoie une requête textuelle avec le protocole Chat Completions ou Responses choisi. La construction valide la configuration sans accès réseau. generate s’exécute dans le processus appelant, renvoie le texte complet et la consommation déclarée si disponible, et gère son délai. Aucune sandbox, CLI d’agent, outil, répétition automatique ou persistance de conversation n’intervient.

[Exemple complet et règles détaillées](../../guide/advanced/model-providers/).

## Paramètres et propriétés

| Nom                        | Type                                             | Présence  | Rôle                                                                                                                                                         |
| -------------------------- | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `OpenAICompatibleOptions`                        | Requis    | Endpoint, modèle, authentification, protocole et limites explicites des appels directs au modèle.                                                            |
| `options.baseUrl`          | `string`                                         | Requis    | URL HTTP(S) absolue de base de l’API, avec son éventuel préfixe /v1 ; sans identifiants, requête ni fragment. Le chemin du protocole choisi est ajouté.      |
| `options.model`            | `string`                                         | Requis    | Identifiant non vide de modèle reconnu par le service choisi ; aucun modèle par défaut n’est déduit.                                                         |
| `options.apiKey`           | `string \| false`                                | Requis    | Clé API bearer explicite, ou false pour un endpoint sans authentification. Aucune variable d’environnement ni connexion de compte n’est lue automatiquement. |
| `options.api`              | `"chat-completions" \| "responses" \| undefined` | Optionnel | Protocole HTTP : chat-completions par défaut, ou responses. Aucun repli automatique entre protocoles.                                                        |
| `options.timeoutMs`        | `number \| undefined`                            | Optionnel | Délai positif en millisecondes couvrant les en-têtes et le corps complet ; 120000 par défaut, maximum 2147483647.                                            |
| `options.maxResponseBytes` | `number \| undefined`                            | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.            |

## Retour

`ModelProvider`

## Signature

```ts
export declare function openaiCompatible(
  options: OpenAICompatibleOptions,
): ModelProvider;
```

## Contrats associés

- [ModelProvider](../modelprovider/)
- [OpenAICompatibleOptions](../openaicompatibleoptions/)
