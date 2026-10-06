---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                             | Présence  | Rôle                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tag`        | `string`                                         | Requis    | Nom de la balise sans chevrons. Le dispatch demande automatiquement une seule réponse balisée finale ; le brief n’a pas besoin de contenir la balise.                                                              |
| `repairs`    | `number`                                         | Requis    | Tours de correction autorisés après une réponse invalide, 0 sauf indication contraire dans les options. Chacun reprend la même conversation et ne demande que la balise corrigée.                                  |
| `format`     | `"text" \| "json" \| undefined`                  | Optionnel | Format du contenu utilisé par les consignes automatiques : json demande du JSON brut conforme à jsonSchema ; text demande du texte. Omettez-le pour un contrat personnalisé demandant un contenu balisé générique. |
| `jsonSchema` | `Readonly<Record<string, unknown>> \| undefined` | Optionnel | JSON Schema d’entrée capturé et inclus dans le prompt lorsque format vaut json ; obligatoire pour ce format. Décrit le JSON avant la validation par schema et toute transformation.                                |
| `read`       | `(text: string) => Promise<T>`                   | Requis    | Extrait la dernière paire &lt;tag>…&lt;/tag> complète d’un texte, la nettoie de ses espaces aux bords et l’analyse. Rejette avec ResponseError si aucune paire complète n’existe ou si son contenu est refusé.     |

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  readonly format?: "json" | "text";
  readonly jsonSchema?: JsonSchema;
  read(text: string): Promise<T>;
}
```

## Contrats associés

- [JsonSchema](../jsonschema/)
