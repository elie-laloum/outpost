---
title: "defineHarnessTool"
description: "defineHarnessTool — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un outil qu’un harness intégré propose au modèle. Valide immédiatement le nom, la description et le schéma d’entrée, et renvoie une définition figée dont validate() contrôle les arguments du modèle avant l’exécution de execute().

[Exemple complet et règles détaillées](../../guide/custom-harness-tools/).

## Paramètres et propriétés

| Nom                   | Type                                                                               | Présence  | Rôle                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `HarnessToolOptions<Input>`                                                        | Requis    | Nom, description, schéma d’entrée, indicateur de lecture seule, fonction resources et fonction execute de l’outil. Les clés inconnues sont refusées.                                                                                                                                                                            |
| `options.workspace`   | `"git" \| undefined`                                                               | Optionnel | Déclare un workspace Git requis ; l’exécution de fichiers refuse cet outil avant acquisition.                                                                                                                                                                                                                                   |
| `options.name`        | `string`                                                                           | Requis    | Nom d’outil unique de 1 à 64 lettres, chiffres, tirets bas ou tirets, présenté au modèle.                                                                                                                                                                                                                                       |
| `options.description` | `string`                                                                           | Requis    | Explication non vide que le modèle lit pour décider quand et comment appeler l’outil.                                                                                                                                                                                                                                           |
| `options.input`       | `Readonly<Record<string, unknown>> \| StandardJsonSchema<Input>`                   | Requis    | Schéma d’entrée : un objet JSON Schema contrôlé par le sous-ensemble intégré (type, properties, required, additionalProperties, items, enum, const et bornes de longueur, de valeur et de nombre d’éléments), ou un Standard Schema qui exporte du JSON Schema, comme Zod 4. Les autres mots-clés sont refusés à la définition. |
| `options.readOnly`    | `boolean \| undefined`                                                             | Optionnel | Marque un outil sans effet de bord, false par défaut. Les appels en lecture seule peuvent s’exécuter en parallèle, et les tours de réparation d’une réponse ne gardent que les outils en lecture seule.                                                                                                                         |
| `options.resources`   | `((input: Input) => ToolResources) \| undefined`                                   | Optionnel | Décrit les chemins et la commande d’une entrée validée pour que les règles de permission puissent les comparer. Un outil sans cette fonction n’est comparé que par son nom.                                                                                                                                                     |
| `options.execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Requis    | Exécute l’appel avec l’entrée validée et son contexte, et renvoie du texte ou { content, isError }. Une exception est traitée selon toolExecution.onError ; les résultats de plus de 100000 caractères sont coupés avant d’atteindre le modèle.                                                                                 |

## Retour

`HarnessTool<Input>`

## Signature

```ts
export declare function defineHarnessTool<Input>(
  options: HarnessToolOptions<Input>,
): HarnessTool<Input>;
```

## Contrats associés

- [HarnessTool](../harnesstool/)
- [HarnessToolOptions](../harnesstooloptions/)
