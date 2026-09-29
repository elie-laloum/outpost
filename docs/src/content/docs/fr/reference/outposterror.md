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

Erreur munie d’un code stable et de détails structurés pour les échecs d’exécution, configuration et récupération. cause conserve l’échec initial et recovery peut identifier du travail conservé ; le nettoyage doit respecter ces emplacements.

[Exemple complet et règles détaillées](../../guide/recovery/).

## Paramètres et propriétés

| Nom        | Type                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recovery` | `Readonly<Record<string, unknown>>` | Requis    | Métadonnées décrivant le workspace et les artefacts de transfert conservés après échec.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `code`     | `FaultCode`                         | Requis    | Catégorie stable d’erreur Outpost utilisée pour le traitement programmatique des échecs.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `details`  | `Readonly<Record<string, unknown>>` | Requis    | Diagnostics structurés attachés au code d’erreur. Les erreurs HTTP de modèles incluent status et, si valide, retryAfterMs : l’attente minimale en millisecondes d’une reprise de tâche explicitement configurée. Les erreurs de quota incluent resetAt lorsque l’heure de réinitialisation est connue, et agent pour les tours de CLI. Les pannes d’agent et de modèle ajoutent unavailable, le signal lu par unavailableFault() ; une erreur de quota résumant un agent de secours épuisé ajoute fallback. |
| `name`     | `string`                            | Requis    | Nom de classe d’erreur permettant de distinguer cet échec des autres erreurs JavaScript.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `message`  | `string`                            | Requis    | Explication lisible de l’échec.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `stack`    | `string \| undefined`               | Optionnel | Trace de pile JavaScript de l’erreur lorsqu’elle est disponible.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `cause`    | `unknown`                           | Optionnel | Échec d’origine attaché à cette erreur.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

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
