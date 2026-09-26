---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication`    | `AgentAuthentication \| undefined`              | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |
| `saveConversations` | `boolean \| undefined`                          | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                                                                                                                                                                                            |

## Signature

```ts
export interface CommonAgentSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)
