---
title: "LoopTaskExhausted"
description: "LoopTaskExhausted — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { LoopTaskExhausted } from "@elie-laloum/outpost";
```

## Rôle et comportement

Erreur enregistrée lorsque la vérification du dernier tour autorisé échoue. Consultez key, maxRounds et feedback via WorkflowResult.errors ; reprendre le même checkpoint ne réinitialise pas la limite.

[Exemple complet et règles détaillées](../../guide/verification-loops/).

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                     |
| ----------- | --------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `key`       | `string`              | Requis    | Clé de la tâche dont la vérification n’a jamais réussi.                                  |
| `maxRounds` | `number`              | Requis    | Limite de tours logiques configurée et atteinte par cette boucle.                        |
| `feedback`  | `string`              | Requis    | Texte renvoyé par la dernière vérification refusée.                                      |
| `name`      | `string`              | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript. |
| `message`   | `string`              | Requis    | Explication lisible de l’échec.                                                          |
| `stack`     | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                         |
| `cause`     | `unknown`             | Optionnel | Échec d’origine attaché à cette erreur.                                                  |

## Signature

```ts
export declare class LoopTaskExhausted extends Error {
  readonly key: string;
  readonly maxRounds: number;
  readonly feedback: string;
  constructor(key: string, maxRounds: number, feedback: string);
}
```
