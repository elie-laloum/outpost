---
title: "HarnessToolOptions"
description: "HarnessToolOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Skills et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessToolOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                               | Présence  | Rôle                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`                                                                           | Requis    | Nom d’outil unique de 1 à 64 lettres, chiffres, tirets bas ou tirets, présenté au modèle.                                                                                   |
| `description` | `string`                                                                           | Requis    | Explication non vide que le modèle lit pour décider quand et comment appeler l’outil.                                                                                       |
| `input`       | `Readonly<Record<string, unknown>> \| StandardJsonSchema<Input>`                   | Requis    | Schéma d’entrée : objet JSON Schema validé par le sous-ensemble intégré, ou Standard Schema qui expose un JSON Schema, comme Zod 4, dont le validateur contrôle l’entrée.   |
| `readOnly`    | `boolean \| undefined`                                                             | Optionnel | Marque les outils sans effet de bord pour qu’ils puissent s’exécuter en parallèle ; false par défaut.                                                                       |
| `resources`   | `((input: Input) => ToolResources) \| undefined`                                   | Optionnel | Décrit les chemins et la commande d’une entrée validée pour que les règles de permission puissent les comparer. Un outil sans cette fonction n’est comparé que par son nom. |
| `execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Requis    | Exécute l’appel avec l’entrée validée et son contexte. Renvoie du texte, ou { content, isError } pour signaler un échec auquel le modèle peut réagir.                       |

## Signature

```ts
export interface HarnessToolOptions<Input> {
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
