---
title: "ModelRequest"
description: "ModelRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                    | Présence  | Rôle                                                                                                                                                                                                                                                                                               |
| ----------------- | --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | `string`                                | Requis    | Identifiant de modèle non vide propre au service ; aucun catalogue local ni sonde de disponibilité.                                                                                                                                                                                                |
| `prompt`          | `string \| undefined`                   | Optionnel | Texte non vide envoyé comme unique message utilisateur. Renseignez exactement un champ parmi prompt et messages.                                                                                                                                                                                   |
| `messages`        | `readonly ModelMessage[] \| undefined`  | Optionnel | Historique de conversation qui commence et se termine par un message utilisateur. Chaque appel d’outil exige exactement un résultat dans le message utilisateur suivant ; les blocs de raisonnement d’un autre fournisseur ou modèle sont retirés avant l’envoi.                                   |
| `system`          | `string \| undefined`                   | Optionnel | Instructions envoyées comme message system de Chat Completions, instructions de Responses ou texte system d’Anthropic.                                                                                                                                                                             |
| `tools`           | `readonly ModelToolSpec[] \| undefined` | Optionnel | Outils que le modèle peut appeler, avec des noms uniques et des entrées en JSON Schema. Le fournisseur les traduit dans son format ; il ne les exécute jamais.                                                                                                                                     |
| `maxOutputTokens` | `number \| undefined`                   | Optionnel | Limite positive de tokens de sortie, envoyée dans max_completion_tokens (Chat Completions), max_output_tokens (Responses) ou max_tokens (Anthropic). Sans elle, une requête Anthropic échoue avec le code configuration ; dans un harness, elle reprend par défaut la limite du modèle de l’agent. |
| `reasoning`       | `ModelReasoning \| undefined`           | Optionnel | Effort de raisonnement de cette requête. Les protocoles OpenAI envoient la valeur telle quelle dans reasoning_effort ou reasoning.effort ; Anthropic traduit none en réflexion désactivée, low à max en réflexion adaptative à cet effort, et refuse minimal.                                      |
| `cache`           | `boolean \| undefined`                  | Optionnel | Demande à Anthropic de mettre en cache le préfixe de la conversation avec un point de cache automatique. OpenAI met en cache les préfixes stables automatiquement et ignore l’option.                                                                                                              |
| `signal`          | `AbortSignal \| undefined`              | Optionnel | Signal d’annulation de cette requête, combiné au délai du fournisseur. L’annulation rejette avec le code aborted ; le fournisseur reste réutilisable.                                                                                                                                              |

## Signature

```ts
export interface ModelRequest {
  readonly model: string;
  readonly prompt?: string;
  readonly messages?: readonly ModelMessage[];
  readonly system?: string;
  readonly tools?: readonly ModelToolSpec[];
  readonly maxOutputTokens?: number;
  readonly reasoning?: ModelReasoning;
  readonly cache?: boolean;
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [ModelMessage](../modelmessage/)
- [ModelReasoning](../modelreasoning/)
- [ModelToolSpec](../modeltoolspec/)
