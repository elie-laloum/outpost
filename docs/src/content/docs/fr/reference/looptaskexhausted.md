---
title: "LoopTaskExhausted"
description: "LoopTaskExhausted — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { LoopTaskExhausted } from "@elie-laloum/outpost/workflows";
```

## Rôle et comportement

Erreur enregistrée lorsque la vérification du dernier tour autorisé échoue. Consultez key, maxRounds et feedback via WorkflowResult.errors ; reprendre le même checkpoint ne réinitialise pas la limite. Le message cite les 1 000 premiers et 1 000 derniers caractères du dernier feedback, qu’un workflow masque avec ses motifs redact avant de le couper ; la propriété feedback garde le texte complet.

[Exemple complet et règles détaillées](../../guide/verification-loops/).

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                                                    |
| ----------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `key`       | `string`              | Requis    | Clé de la tâche dont la vérification n’a jamais réussi.                                                 |
| `maxRounds` | `number`              | Requis    | Limite de tours logiques configurée et atteinte par cette boucle.                                       |
| `feedback`  | `string`              | Requis    | Texte renvoyé par la dernière vérification refusée.                                                     |
| `name`      | `string`              | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                |
| `message`   | `string`              | Requis    | Explication lisible de l’échec.                                                                         |
| `stack`     | `string \| undefined` | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                        |
| `cause`     | `unknown`             | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne. |

## Signature

```ts
export declare class LoopTaskExhausted extends Error {
  readonly key: string;
  readonly maxRounds: number;
  readonly feedback: string;
  /** `shown` is the feedback quoted in the message, such as a redacted copy; it defaults to `feedback`. */
  constructor(key: string, maxRounds: number, feedback: string, shown?: string);
}
```
