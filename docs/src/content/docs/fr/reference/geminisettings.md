---
title: "GeminiSettings"
description: "GeminiSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GeminiSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                        | Présence  | Rôle                                                                    |
| -------------- | ----------------------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `model`        | `string \| undefined`                                       | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.            |
| `variables`    | `Readonly<Record<string, string>> \| undefined`             | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes. |
| `approvalMode` | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optionnel | Mode d’approbation des outils du CLI Gemini.                            |

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
