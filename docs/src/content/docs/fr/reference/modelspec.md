---
title: "ModelSpec"
description: "ModelSpec — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ModelSpec } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom               | Type                          | Présence          | Rôle                                                                                                                                                                                                                                                                |
| ----------------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                      | Selon la variante | Identifiant de modèle non vide transmis tel quel à la CLI ou au service ; aucun catalogue local n’est consulté.                                                                                                                                                     |
| `reasoning`       | `ModelReasoning \| undefined` | Selon la variante | Effort de raisonnement ; absent, le défaut du modèle s’applique. Claude Code et Codex acceptent low à max, le fournisseur Anthropic none et low à max, le fournisseur OpenAI tout niveau ; les autres CLI lèvent le code configuration à la composition de l’agent. |
| `maxOutputTokens` | `number \| undefined`         | Selon la variante | Limite entière positive de tokens de sortie par réponse du modèle. Claude Code la reçoit via CLAUDE_CODE_MAX_OUTPUT_TOKENS, le fournisseur OpenAI l’envoie à chaque requête et le fournisseur Anthropic l’exige ; Codex, Antigravity, Copilot et Kimi la refusent.  |

## Signature

```ts
export type ModelSpec = string | AgentModel;
```

## Contrats associés

- [AgentModel](../agentmodel/)
