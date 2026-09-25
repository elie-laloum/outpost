---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                                  | Présence  | Rôle                                                                                             |
| ------------------- | ----------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `modelProvider`     | `CodexModelProvider \| undefined`                     | Optionnel | Configuration d’un endpoint de modèle Codex personnalisé ; exige la compatibilité Responses API. |
| `reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| undefined` | Optionnel | Niveau d’effort de raisonnement transmis au CLI de l’agent choisi.                               |
| `approvalReviewer`  | `"user" \| "auto_review" \| undefined`                | Optionnel | Responsable de l’approbation Codex : utilisateur ou revue automatique.                           |
| `model`             | `string \| undefined`                                 | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.                                     |
| `variables`         | `Readonly<Record<string, string>> \| undefined`       | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                          |
| `saveConversations` | `boolean \| undefined`                                | Optionnel | Activer la capture native si l’adapter la prend en charge.                                       |

## Signature

```ts
export interface CodexSettings extends CommonAgentSettings {
  readonly modelProvider?: CodexModelProvider;
  readonly reasoning?: "low" | "medium" | "high" | "xhigh";
  readonly approvalReviewer?: "user" | "auto_review";
}
```

## Contrats associés

- [CodexModelProvider](../codexmodelprovider/)
- [CommonAgentSettings](../support-commonagentsettings/)
