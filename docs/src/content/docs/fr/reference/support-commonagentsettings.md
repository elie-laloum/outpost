---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authentication`    | `AgentAuthentication \| undefined`              | Optionnel | Choix des identifiants : "account" (connexion d’abonnement), "usage" (clé API), { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Codex refuse account key et variable et n’accepte que usage avec modelProvider ; les formes non prises en charge échouent à la composition de l’agent. En son absence, Outpost n’installe aucun identifiant. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes de cette CLI, fusionnées par-dessus .outpost/.env ; un nom également défini par le provider de sandbox échoue avec le code configuration. Claude Code refuse ici CLAUDE_CODE_MAX_OUTPUT_TOKENS ou MCP_TIMEOUT quand maxOutputTokens ou startupTimeoutMs les définit déjà.                                                        |
| `saveConversations` | `boolean \| undefined`                          | Optionnel | Enregistre la conversation native après chaque tour, true par défaut. false désactive la capture et ne peut pas être combiné avec conversations.                                                                                                                                                                                                                         |
| `conversations`     | `ConversationStore \| undefined`                | Optionnel | Store de conversations utilisé à la place du store natif, par exemple createTransportConversations() sur le format de l’agent. Un store d’un autre format, ou saveConversations: false, échoue dès la création du harness.                                                                                                                                               |
| `mcpServers`        | `McpServers \| undefined`                       | Optionnel | Serveurs MCP indexés par nom, transmis en ligne de commande : --mcp-config pour Claude Code, surcharges -c pour Codex. Les secrets restent des références de variables ; une variable référencée non déclarée échoue avant le démarrage de l’agent.                                                                                                                      |

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
