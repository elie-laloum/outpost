---
title: "ReportPass"
description: "ReportPass — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom    | Type                  | Présence  | Rôle                                                                                          |
| ------ | --------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `pass` | `number \| undefined` | Optionnel | Numéro de passe d’agent commençant à un, attaché à une observation ou à l’état du rapporteur. |

## Signature

```ts
export type ReportPass = {
  readonly pass?: number;
};
```
