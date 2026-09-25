---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                                                                                             |
| ------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `model`             | `string \| undefined`                           | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.                                                                                     |
| `authentication`    | `AgentAuthentication \| undefined`              | Optionnel | Préparation explicite de l’authentification de ce harness CLI. Son absence conserve l’accès déjà configuré sans rechercher des credentials hôte. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                          |
| `saveConversations` | `boolean \| undefined`                          | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                       |

## Signature

```ts
export interface CommonAgentSettings {
  readonly model?: string;
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)
