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

| Nom               | Type                          | Présence          | Rôle                                                                                                                                                                                                         |
| ----------------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`            | `string`                      | Selon la variante | Identifiant de modèle non vide transmis tel quel à la CLI ou au service ; aucun catalogue local n’est consulté.                                                                                              |
| `reasoning`       | `ModelReasoning \| undefined` | Selon la variante | Effort de raisonnement optionnel. Chaque harness ou fournisseur n’accepte que les niveaux qu’il sait exprimer et refuse les autres à la composition de l’agent ; son absence conserve le défaut du modèle.   |
| `maxOutputTokens` | `number \| undefined`         | Selon la variante | Limite positive optionnelle de tokens de sortie pour chaque réponse du modèle. Claude Code la reçoit via CLAUDE_CODE_MAX_OUTPUT_TOKENS ; Codex et Gemini CLI la refusent ; le fournisseur Anthropic l’exige. |

## Signature

```ts
export type ModelSpec = string | AgentModel;
```

## Contrats associés

- [AgentModel](../agentmodel/)
