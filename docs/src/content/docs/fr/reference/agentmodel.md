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

| Nom               | Type                          | Présence  | Rôle                                                                                                                                                                                                                                                                |
| ----------------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                      | Requis    | Identifiant de modèle non vide transmis tel quel à la CLI ou au service ; aucun catalogue local n’est consulté.                                                                                                                                                     |
| `reasoning`       | `ModelReasoning \| undefined` | Optionnel | Effort de raisonnement ; absent, le défaut du modèle s’applique. Claude Code et Codex acceptent low à max, le fournisseur Anthropic none et low à max, le fournisseur OpenAI tout niveau ; les autres CLI lèvent le code configuration à la composition de l’agent. |
| `maxOutputTokens` | `number \| undefined`         | Optionnel | Limite entière positive de tokens de sortie par réponse du modèle. Claude Code la reçoit via CLAUDE_CODE_MAX_OUTPUT_TOKENS, le fournisseur OpenAI l’envoie à chaque requête et le fournisseur Anthropic l’exige ; Codex, Antigravity, Copilot et Kimi la refusent.  |

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
