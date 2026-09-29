---
title: "ReportPass"
description: "ReportPass — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom    | Type                  | Présence  | Rôle                                                                                      |
| ------ | --------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `pass` | `number \| undefined` | Optionnel | Numéro de passe affiché dans le préfixe de ligne ; absent pour les événements hors passe. |

## Signature

```ts
export type ReportPass = {
  readonly pass?: number;
};
```
