---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 10
---

Contrat public de **CodexSettings**. Consultez le [guide agents](../../guide/agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configurer Claude Code, Codex ou Gemini indépendamment du backend de sandbox.

La CLI choisit son modèle si omis. La capture native est activée par défaut pour Claude/Codex. Gemini ne prend en charge que les nouvelles sessions. Identifiants d’agent et de provider sont distincts.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                 | Type                                                  | Présence  | Rôle                                                                             |
| ------------------- | ----------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `modelProvider`     | `CodexModelProvider \| undefined`                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `approvalReviewer`  | `"user" \| "auto_review" \| undefined`                | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `model`             | `string \| undefined`                                 | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.                     |
| `variables`         | `Readonly<Record<string, string>> \| undefined`       | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.          |
| `saveConversations` | `boolean \| undefined`                                | Optionnel | Activer la capture native si l’adapter la prend en charge.                       |

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
