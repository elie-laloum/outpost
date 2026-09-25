---
title: "GeminiSettings"
description: "GeminiSettings — Outpost API"
sidebar:
  order: 10
---

Contrat public de **GeminiSettings**. Consultez le [guide agents](../../guide/agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { GeminiSettings } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configurer Claude Code, Codex ou Gemini indépendamment du backend de sandbox.

La CLI choisit son modèle si omis. La capture native est activée par défaut pour Claude/Codex. Gemini ne prend en charge que les nouvelles sessions. Identifiants d’agent et de provider sont distincts.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom            | Type                                                        | Présence  | Rôle                                                                             |
| -------------- | ----------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `model`        | `string \| undefined`                                       | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.                     |
| `variables`    | `Readonly<Record<string, string>> \| undefined`             | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.          |
| `approvalMode` | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface GeminiSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly approvalMode?: "default" | "auto_edit" | "yolo" | "plan";
}
```

## Contrats associés

- [Variables](../variables/)
