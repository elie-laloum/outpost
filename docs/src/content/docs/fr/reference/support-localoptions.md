---
title: "LocalOptions"
description: "LocalOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

| Nom         | Type                                            | Présence  | Rôle                                                                                                                                                 |
| ----------- | ----------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variables` | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement ajoutées aux commandes hôtes, en valeurs littérales. Une clé aussi déclarée par l’agent échoue avec le code configuration. |

## Signature

```ts
export type LocalOptions = {
  variables?: Variables;
};
```

## Contrats associés

- [Variables](../variables/)
