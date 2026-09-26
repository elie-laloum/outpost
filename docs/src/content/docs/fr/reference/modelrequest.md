---
title: "ModelRequest"
description: "ModelRequest — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : requêtes bornées avec messages, outils, raisonnement et cache d’historique pour les harness personnalisés. Pas encore de streaming ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { ModelRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                                    | Présence  | Rôle                                                                                                                                                                                                                                                             |
| ----------------- | --------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | `string`                                | Requis    | Identifiant de modèle non vide propre au service ; aucun catalogue local ni sonde de disponibilité.                                                                                                                                                              |
| `prompt`          | `string \| undefined`                   | Optionnel | Texte non vide envoyé comme unique message utilisateur. Utilisez-le ou messages, jamais les deux ; aucun contenu du dépôt n’est collecté automatiquement.                                                                                                        |
| `messages`        | `readonly ModelMessage[] \| undefined`  | Optionnel | Historique de conversation qui commence et se termine par un message utilisateur. Chaque appel d’outil exige exactement un résultat dans le message utilisateur suivant ; les blocs de raisonnement d’un autre fournisseur ou modèle sont retirés avant l’envoi. |
| `system`          | `string \| undefined`                   | Optionnel | Instructions optionnelles envoyées comme message system de Chat Completions, instructions de Responses ou texte system d’Anthropic.                                                                                                                              |
| `tools`           | `readonly ModelToolSpec[] \| undefined` | Optionnel | Outils que le modèle peut appeler, avec des noms uniques et des entrées en JSON Schema. Le fournisseur les traduit dans son format ; il ne les exécute jamais.                                                                                                   |
| `maxOutputTokens` | `number \| undefined`                   | Optionnel | Limite positive de tokens de sortie transmise dans max_completion_tokens, max_output_tokens ou max_tokens. Optionnelle pour OpenAI, exigée par Anthropic. Dans un harness personnalisé, elle reprend par défaut la limite du modèle de l’agent.                  |
| `reasoning`       | `ModelReasoning \| undefined`           | Optionnel | Effort de raisonnement optionnel pour cette requête. OpenAI l’envoie dans reasoning_effort ou reasoning.effort ; Anthropic traduit none en réflexion désactivée et low à max en réflexion adaptative avec cet effort, et refuse minimal.                         |
| `cache`           | `boolean \| undefined`                  | Optionnel | Demande à Anthropic de mettre en cache le préfixe de la conversation avec un point de cache automatique. OpenAI met en cache les préfixes stables automatiquement et ignore l’option.                                                                            |
| `signal`          | `AbortSignal \| undefined`              | Optionnel | Signal d’annulation de l’appelant pour cette requête, combiné au délai du fournisseur. L’annulation ne détruit pas le client réutilisable.                                                                                                                       |

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
