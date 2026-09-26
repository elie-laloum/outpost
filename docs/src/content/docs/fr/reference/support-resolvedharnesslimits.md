---
title: "ResolvedHarnessLimits"
description: "ResolvedHarnessLimits — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom            | Type                          | Présence  | Rôle                                                                        |
| -------------- | ----------------------------- | --------- | --------------------------------------------------------------------------- |
| `maxSteps`     | `number`                      | Requis    | Nombre maximal effectif de requêtes au modèle par passe, défauts appliqués. |
| `maxToolCalls` | `number \| undefined`         | Optionnel | Nombre maximal d’appels d’outils par passe, s’il est défini.                |
| `usage`        | `Partial<Usage> \| undefined` | Optionnel | Budget de tokens configuré par compteur d’usage, s’il est défini.           |

## Signature

```ts
export interface ResolvedHarnessLimits extends HarnessLimits {
  readonly maxSteps: number;
}
```

## Contrats associés

- [HarnessLimits](../harnesslimits/)
