---
title: "LocalOptions"
description: "LocalOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom         | Type                                            | Présence  | Rôle                                                                    |
| ----------- | ----------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `variables` | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes. |

## Signature

```ts
export type LocalOptions = {
  variables?: Variables;
};
```

## Contrats associés

- [Variables](../variables/)
