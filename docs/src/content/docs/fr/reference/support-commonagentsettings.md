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
| `conversations`     | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les sessions de cet agent au lieu du store natif par défaut, par exemple transportConversations() au format de l’agent. Le format doit correspondre à l’agent et saveConversations ne doit pas valoir false.                                                                  |
| `mcpServers`        | `McpServers \| undefined`                       | Optionnel | Serveurs MCP utilisables par cette CLI, indexés par nom de serveur. Outpost les traduit dans la configuration native de la CLI et ne référence les secrets que par nom de variable ; chaque variable référencée doit être déclarée.                                                                                   |

## Signature

```ts
export interface CommonAgentSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
  readonly conversations?: ConversationStore;
  readonly mcpServers?: McpServers;
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [ConversationStore](../conversationstore/)
- [McpServers](../mcpservers/)
- [Variables](../variables/)
