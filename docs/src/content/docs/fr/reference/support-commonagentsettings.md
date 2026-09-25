---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                    |
| ------------------- | ----------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `model`             | `string \| undefined`                           | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.            |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes. |
| `saveConversations` | `boolean \| undefined`                          | Optionnel | Activer la capture native si l’adapter la prend en charge.              |

## Signature

```ts
export interface CommonAgentSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
```

## Contrats associés

- [Variables](../variables/)
