---
title: "RecipeEnqueueOptions"
description: "RecipeEnqueueOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeEnqueueOptions } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom              | Type                                                  | Présence  | Rôle                                                                                                                                     |
| ---------------- | ----------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `queue`          | `string`                                              | Requis    | File nommée avec préfixe queues. facultatif ; seules cette file et ses dépendances sont préparées.                                       |
| `handler`        | `string`                                              | Requis    | Nom du handler de confiance enregistré par un worker démarré séparément.                                                                 |
| `runId`          | `string`                                              | Requis    | Run ID de checkpoint joint aux paramètres dans l’entrée native du job.                                                                   |
| `id`             | `string \| undefined`                                 | Optionnel | ID de job explicite ; vaut recipe:&lt;handler>:&lt;runId> par défaut pour une publication répétée déterministe.                          |
| `idempotencyKey` | `string \| undefined`                                 | Optionnel | Clé d’effet stable lors de la publication volontaire d’un nouvel ID pour le même effet ; la destination doit conserver sa déduplication. |
| `deadline`       | `number \| undefined`                                 | Optionnel | Échéance absolue en millisecondes epoch appliquée par la file sélectionnée.                                                              |
| `signal`         | `AbortSignal \| undefined`                            | Optionnel | Annule la préparation avant publication ; l’opération native enqueue n’accepte pas de paramètre d’annulation.                            |
| `inputs`         | `Readonly<Record<string, WorkflowJson>> \| undefined` | Optionnel | Paramètres de recette validés et complétés par les valeurs par défaut avant préparation de la file.                                      |

## Signature

```ts
export interface RecipeEnqueueOptions extends Pick<
  RecipeRunOptions,
  "inputs" | "signal"
> {
  readonly queue: string;
  readonly handler: string;
  readonly runId: string;
  readonly id?: string;
  readonly idempotencyKey?: string;
  readonly deadline?: number;
}
```

## Contrats associés

- [RecipeRunOptions](../reciperunoptions/)
