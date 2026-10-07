---
title: "RunReportOptions"
description: "RunReportOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReportOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                                | Présence  | Rôle                                                                                                                                                                     |
| -------- | ----------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format` | `"json" \| "markdown" \| undefined` | Optionnel | Sérialisation de sortie : markdown par défaut, ou json pour une chaîne RunReport version 1 indentée. Un format non pris en charge lève une erreur à l’appel de report(). |

## Signature

```ts
export interface RunReportOptions {
  readonly format?: "markdown" | "json";
}
```
