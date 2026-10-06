---
title: "DecisionProviderResult"
description: "DecisionProviderResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionProviderResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                | Présence  | Rôle                                                                                                       |
| ----------- | ----------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `model`     | `string`                            | Requis    | Nom non vide du modèle réellement signalé par la réponse du provider.                                      |
| `answers`   | `Readonly<Record<string, unknown>>` | Requis    | Objets de réponses natifs non fiables, validés par decide selon chaque question déclarée.                  |
| `usage`     | `Usage \| undefined`                | Optionnel | Reçu d’usage normalisé facultatif ; un usage absent devient incomplet sans prouver une consommation nulle. |
| `truncated` | `boolean \| undefined`              | Optionnel | Troncature d’entrée signalée ; son absence ne prouve pas que l’entrée entière a été évaluée.               |
| `metadata`  | `WorkflowJson \| undefined`         | Optionnel | Extensions JSON sans perte facultatives ; l’adapter System One conserve ici la réponse native complète.    |

## Signature

```ts
export interface DecisionProviderResult {
  readonly model: string;
  readonly answers: Readonly<Record<string, unknown>>;
  readonly usage?: Usage;
  readonly truncated?: boolean;
  readonly metadata?: WorkflowJson;
}
```

## Contrats associés

- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
