---
title: "defineHarnessTool"
description: "defineHarnessTool — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import { defineHarnessTool } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un outil que le moteur peut proposer au modèle. Valide immédiatement le nom, la description et le schéma d’entrée, et renvoie une définition figée dont validate() contrôle les arguments du modèle avant l’exécution de execute().

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                   | Type                                                                               | Présence  | Rôle                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `HarnessToolOptions<Input>`                                                        | Requis    | Nom, description, schéma d’entrée, indicateur de lecture seule et fonction execute de l’outil.                                                                              |
| `options.name`        | `string`                                                                           | Requis    | Nom d’outil unique de 1 à 64 lettres, chiffres, tirets bas ou tirets, présenté au modèle.                                                                                   |
| `options.description` | `string`                                                                           | Requis    | Explication non vide que le modèle lit pour décider quand et comment appeler l’outil.                                                                                       |
| `options.input`       | `Readonly<Record<string, unknown>> \| StandardJsonSchema<Input>`                   | Requis    | Schéma d’entrée : objet JSON Schema validé par le sous-ensemble intégré, ou Standard Schema qui expose un JSON Schema, comme Zod 4, dont le validateur contrôle l’entrée.   |
| `options.readOnly`    | `boolean \| undefined`                                                             | Optionnel | Marque les outils sans effet de bord pour qu’ils puissent s’exécuter en parallèle ; false par défaut.                                                                       |
| `options.resources`   | `((input: Input) => ToolResources) \| undefined`                                   | Optionnel | Décrit les chemins et la commande d’une entrée validée pour que les règles de permission puissent les comparer. Un outil sans cette fonction n’est comparé que par son nom. |
| `options.execute`     | `(input: Input, context: HarnessToolContext) => ToolOutput \| Promise<ToolOutput>` | Requis    | Exécute l’appel avec l’entrée validée et son contexte. Renvoie du texte, ou { content, isError } pour signaler un échec auquel le modèle peut réagir.                       |

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
