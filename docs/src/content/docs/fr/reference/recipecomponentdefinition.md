---
title: "RecipeComponentDefinition"
description: "RecipeComponentDefinition — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeComponentDefinition } from "@elie-laloum/outpost/recipes";
```

## Paramètres et propriétés

| Nom            | Type                                                                                                           | Présence  | Rôle                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| `name`         | `string`                                                                                                       | Requis    | Identifiant unique de factory sous la forme catégorie.nom, par exemple sink.console.                                    |
| `kind`         | `string`                                                                                                       | Requis    | Catégorie de l’objet produit ; les références doivent demander cette catégorie exacte.                                  |
| `schema`       | `Readonly<Record<string, unknown>>`                                                                            | Requis    | JSON Schema statique des options ; les annotations component identifient les références typées imbriquées.              |
| `experimental` | `boolean \| undefined`                                                                                         | Optionnel | Exige experimental: true dans le YAML local avant d’accepter cette factory.                                             |
| `create`       | `(options: Readonly<Record<string, unknown>>, context: RecipeComponentContext) => unknown \| Promise<unknown>` | Requis    | Construit le composant après validation statique ; les dépendances se résolvent via le contexte.                        |
| `accepts`      | `(value: unknown) => boolean`                                                                                  | Requis    | Valide l’objet renvoyé par cette factory ou une extension locale de la même catégorie.                                  |
| `dispose`      | `((value: unknown) => void \| Promise<void>) \| undefined`                                                     | Optionnel | Libère les objets créés par cette factory après leurs consommateurs ; absent pour les objets sans ressources possédées. |

## Signature

```ts
export interface RecipeComponentDefinition {
  readonly name: string;
  readonly kind: string;
  readonly schema: JsonSchema;
  readonly experimental?: boolean;
  create(
    options: Readonly<Record<string, unknown>>,
    context: RecipeComponentContext,
  ): unknown | Promise<unknown>;
  accepts(value: unknown): boolean;
  dispose?(value: unknown): void | Promise<void>;
}
```

## Contrats associés

- [JsonSchema](../jsonschema/)
- [RecipeComponentContext](../recipecomponentcontext/)
