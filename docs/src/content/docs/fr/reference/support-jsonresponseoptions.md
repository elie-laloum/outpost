---
title: "JsonResponseOptions"
description: "JsonResponseOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom          | Type                                                                                     | Présence          | Rôle                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`        | `string`                                                                                 | Requis            | Nom de la balise, sans chevrons : une lettre suivie de lettres, chiffres, _ ou -. Toute autre forme échoue avec le code configuration.                                                                                                                                                                                                                                                                            |
| `repairs`    | `number \| undefined`                                                                    | Optionnel         | Tours de correction autorisés après une réponse invalide, 0 par défaut ; entier positif ou nul. Au-dessus de 0, l’agent doit pouvoir reprendre sa conversation.                                                                                                                                                                                                                                                   |
| `schema`     | `StandardJsonSchema<T> \| StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis            | Validateur Standard Schema ou fonction recevant le JSON analysé comme unknown et renvoyant la valeur typée, éventuellement transformée. Des problèmes signalés ou une erreur levée rejettent la réponse. La conversion automatique du schéma d’entrée exige Standard JSON Schema ; sinon jsonSchema est obligatoire.                                                                                              |
| `jsonSchema` | `Readonly<Record<string, unknown>> \| undefined \| Readonly<Record<string, unknown>>`    | Selon la variante | Objet JSON Schema d’entrée explicite inclus dans les consignes automatiques de réponse finale. Obligatoire sauf si schema prend en charge la conversion Standard JSON Schema ; prioritaire sur la conversion. Capturé sous forme de copie JSON sans perte figée en profondeur, sans les métadonnées de protocole ~standard non énumérables ; schema reste le validateur. Aucune référence distante n’est chargée. |

## Signature

```ts
export type JsonResponseOptions<T> = {
  tag: string;
  repairs?: number;
} & (
  | {
      schema: StandardJsonSchema<T>;
      jsonSchema?: JsonSchema;
    }
  | {
      schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
      jsonSchema: JsonSchema;
    }
);
```

## Contrats associés

- [JsonSchema](../jsonschema/)
- [StandardJsonSchema](../standardjsonschema/)
- [StandardValidator](../standardvalidator/)
