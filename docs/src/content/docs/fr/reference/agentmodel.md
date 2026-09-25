---
title: "AgentModel"
description: "AgentModel — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentModel } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom               | Type                          | Présence  | Rôle                                                                                                                                                                                                         |
| ----------------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`            | `string`                      | Requis    | Identifiant de modèle non vide transmis tel quel à la CLI ou au service ; aucun catalogue local n’est consulté.                                                                                              |
| `reasoning`       | `ModelReasoning \| undefined` | Optionnel | Effort de raisonnement optionnel. Chaque harness ou fournisseur n’accepte que les niveaux qu’il sait exprimer et refuse les autres à la composition de l’agent ; son absence conserve le défaut du modèle.   |
| `maxOutputTokens` | `number \| undefined`         | Optionnel | Limite positive optionnelle de tokens de sortie pour chaque réponse du modèle. Claude Code la reçoit via CLAUDE_CODE_MAX_OUTPUT_TOKENS ; Codex et Gemini CLI la refusent ; le fournisseur Anthropic l’exige. |

## Signature

```ts
export interface AgentModel {
  readonly name: string;
  readonly reasoning?: ModelReasoning;
  readonly maxOutputTokens?: number;
}
```

## Contrats associés

- [ModelReasoning](../modelreasoning/)
