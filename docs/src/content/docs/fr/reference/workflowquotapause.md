---
title: "WorkflowQuotaPause"
description: "WorkflowQuotaPause — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowQuotaPause } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                                                                                            |
| -------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `requestedAt`  | `string`              | Requis    | Horodatage ISO auquel l’erreur de quota a mis la tâche en pause.                                                                                |
| `message`      | `string`              | Requis    | Message de quota signalé par l’agent ou le fournisseur de modèle.                                                                               |
| `resetAt`      | `string \| undefined` | Optionnel | Horodatage ISO de réinitialisation de la limite, lorsque le fournisseur l’a indiqué ; sans cette valeur, la reprise a lieu au prochain start(). |
| `conversation` | `string \| undefined` | Optionnel | Conversation de la tentative interrompue, enregistrée seulement si elle a été capturée et peut être restaurée dans un nouveau sandbox.          |
| `branch`       | `string \| undefined` | Optionnel | Branche de travail conservée par la tentative interrompue, utilisée pour démarrer un dispatch isolé intégré depuis son travail commité.         |

## Signature

```ts
export interface WorkflowQuotaPause {
  readonly requestedAt: string;
  readonly message: string;
  readonly resetAt?: string;
  /** Captured conversation of the interrupted attempt, portable to a new sandbox. */
  readonly conversation?: string;
  /** Retained work branch of the interrupted attempt. */
  readonly branch?: string;
}
```
