---
title: "ModelRequest"
description: "ModelRequest — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : requêtes texte bornées et exécution de harness fournie par l’appelant. Sans boucle d’outils intégrée, streaming ni persistance native des conversations personnalisées.
:::

## Import

```ts
import type { ModelRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                       | Présence  | Rôle                                                                                                                                                                                    |
| ----------------- | -------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | `string`                   | Requis    | Identifiant de modèle non vide propre au service ; aucun catalogue local ni sonde de disponibilité.                                                                                     |
| `prompt`          | `string`                   | Requis    | Texte non vide envoyé comme entrée utilisateur de cette requête ; aucun contenu du dépôt n’est collecté automatiquement.                                                                |
| `system`          | `string \| undefined`      | Optionnel | Texte optionnel envoyé comme message system de Chat Completions ou instructions de Responses.                                                                                           |
| `maxOutputTokens` | `number \| undefined`      | Optionnel | Limite positive de tokens de sortie transmise dans max_completion_tokens ou max_output_tokens ; omise par défaut. La disponibilité et le décompte du raisonnement dépendent du service. |
| `signal`          | `AbortSignal \| undefined` | Optionnel | Signal d’annulation de l’appelant pour cette requête, combiné au délai du fournisseur. L’annulation ne détruit pas le client réutilisable.                                              |

## Signature

```ts
export interface ModelRequest {
  readonly model: string;
  readonly prompt: string;
  readonly system?: string;
  readonly maxOutputTokens?: number;
  readonly signal?: AbortSignal;
}
```
