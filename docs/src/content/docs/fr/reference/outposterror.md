---
title: "OutpostError"
description: "OutpostError — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { OutpostError } from "@elie-laloum/outpost";
```

## Rôle et comportement

Erreur levée par Outpost avec un code stable, des details figés et un enregistrement recovery. cause contient l’échec reclassé ou enveloppé. Vous pouvez la lever vous-même avec new OutpostError(code, message, details?, cause?).

[Exemple complet et règles détaillées](../../guide/error-handling/).

## Paramètres et propriétés

| Nom        | Type                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ----------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Emplacements du travail conservé après l’échec, par exemple branch, directory, commits, transcript, logReference ou conversation ; vide si rien n’a été conservé. Un échec de synchronisation distante place plutôt son répertoire de transfert dans details.recovery.                                                                                                                                                                              |
| `code`     | `FaultCode`                         | Requis    | Catégorie stable d’erreur Outpost utilisée pour le traitement programmatique des échecs.                                                                                                                                                                                                                                                                                                                                                            |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Diagnostics figés propres au code : status, stdout, stderr et conversation pour un processus d’agent en échec ; status et retryAfterMs (l’attente minimale d’une reprise de tâche) pour une erreur HTTP de modèle ; resetAt pour un quota, et fallback quand chaque candidat d’un agent de secours en a atteint un. unavailable signale une panne à unavailableFault(), y compris un délai dépassé après un échec de connexion signalé par l’agent. |
| `name`     | `string`                            | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                                                                                                                                                                                                                                                                                                                                                            |
| `message`  | `string`                            | Requis    | Explication lisible de l’échec.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `stack`    | `string \| undefined`               | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                                                                                                                                                                                                                                                                                                                                                                    |
| `cause`    | `unknown`                           | Optionnel | Échec sous-jacent que cette erreur enveloppe ; quotaFault() et unavailableFault() suivent cette chaîne.                                                                                                                                                                                                                                                                                                                                             |

## Signature

```ts
export declare class OutpostError extends Error {
  recovery: Readonly<Record<string, unknown>>;
  readonly code: FaultCode;
  readonly details: Readonly<Record<string, unknown>>;
  constructor(
    code: FaultCode,
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
  );
}
```

## Contrats associés

- [FaultCode](../faultcode/)
