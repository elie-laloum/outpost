---
title: "ResponseError"
description: "ResponseError — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResponseError**. Consultez le [guide prompts et réponses](../../guide/agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { ResponseError } from "@elie-laloum/outpost";
```

## Rôle et comportement

Fournir un brief littéral ou fichier et valider une réponse balisée avant d’exposer sa valeur typée.

Fournissez exactement une forme de brief. L’expansion vaut par défaut 30 secondes par commande originale. Les réparations de réponse valent zéro par défaut. Une réponse structurée exige une passe.

[Exemple complet et règles détaillées](../../guide/agents/responses/).

## Paramètres et propriétés

| Nom        | Type                                | Présence  | Rôle                                                                             |
| ---------- | ----------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `tag`      | `string`                            | Requis    | Identifiant de balise de type XML.                                               |
| `raw`      | `string \| undefined`               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `code`     | `FaultCode`                         | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `name`     | `string`                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `message`  | `string`                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `stack`    | `string \| undefined`               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `cause`    | `unknown`                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export declare class ResponseError extends OutpostError {
  readonly tag: string;
  readonly raw: string | undefined;
  constructor(tag: string, message: string, raw?: string, cause?: unknown);
}
```

## Contrats associés

- [OutpostError](../outposterror/)
