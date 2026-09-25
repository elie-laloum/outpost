---
title: "OutpostError"
description: "OutpostError — Outpost API"
sidebar:
  order: 10
---

Contrat public de **OutpostError**. Consultez le [guide erreurs](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { OutpostError } from "@elie-laloum/outpost";
```

## Rôle et comportement

Identifier les codes d’échec et chemins de récupération avant reprise ou nettoyage.

Un agent en échec lève une erreur ; une commande brute peut renvoyer un statut non nul. Préservez erreurs originales et artefacts de récupération lors du diagnostic ou de la reprise.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom        | Type                                | Présence  | Rôle                                                                             |
| ---------- | ----------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `code`     | `FaultCode`                         | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `name`     | `string`                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `message`  | `string`                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `stack`    | `string \| undefined`               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `cause`    | `unknown`                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
