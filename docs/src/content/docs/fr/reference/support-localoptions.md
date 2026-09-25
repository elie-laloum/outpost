---
title: "LocalOptions"
description: "LocalOptions — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

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
