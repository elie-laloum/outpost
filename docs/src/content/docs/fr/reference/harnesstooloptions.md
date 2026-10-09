---
title: "HarnessToolOptions"
description: "HarnessToolOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessToolOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                               | Présence  | Rôle                                                                                                                                                                                                                                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspace`   | `"git" \| undefined`                                                               | Optionnel | Déclare un workspace Git requis ; l’exécution de fichiers refuse cet outil avant acquisition.                                                                                                                                                                                                                                   |
| `name`        | `string`                                                                           | Requis    | Nom d’outil unique de 1 à 64 lettres, chiffres, tirets bas ou tirets, présenté au modèle.                                                                                                                                                                                                                                       |
| `description` | `string`                                                                           | Requis    | Explication non vide que le modèle lit pour décider quand et comment appeler l’outil.                                                                                                                                                                                                                                           |
| `input`       | `Readonly<Record<string, unknown>> \| StandardJsonSchema<Input>`                   | Requis    | Schéma d’entrée : un objet JSON Schema contrôlé par le sous-ensemble intégré (type, properties, required, additionalProperties, items, enum, const et bornes de longueur, de valeur et de nombre d’éléments), ou un Standard Schema qui exporte du JSON Schema, comme Zod 4. Les autres mots-clés sont refusés à la définition. |
| `readOnly`    | `boolean \| undefined`                                                             | Optionnel | Marque un outil sans effet de bord, false par défaut. Les appels en lecture seule peuvent s’exécuter en parallèle, et les tours de réparation d’une réponse ne gardent que les outils en lecture seule.                                                                                                                         |
| `resources`   | `((input: Input) => ToolResources) \| undefined`                                   | Optionnel | Décrit les chemins et la commande d’une entrée validée pour que les règles de permission puissent les comparer. Un outil sans cette fonction n’est comparé que par son nom.                                                                                                                                                     |
| `execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Requis    | Exécute l’appel avec l’entrée validée et son contexte, et renvoie du texte ou { content, isError }. Une exception est traitée selon toolExecution.onError ; les résultats de plus de 100000 caractères sont coupés avant d’atteindre le modèle.                                                                                 |

## Signature

```ts
export interface HarnessToolOptions<Input> {
  readonly workspace?: "git";
  readonly name: string;
  readonly description: string;
  readonly input: StandardJsonSchema<Input> | JsonSchema;
  readonly readOnly?: boolean;
  resources?(input: Input): ToolResources;
  execute(
    input: Input,
    context: HarnessToolContext,
  ): ToolOutput | Promise<ToolOutput>;
}
```

## Contrats associés

- [HarnessToolContext](../harnesstoolcontext/)
- [JsonSchema](../jsonschema/)
- [StandardJsonSchema](../standardjsonschema/)
- [ToolOutput](../tooloutput/)
- [ToolResources](../toolresources/)
