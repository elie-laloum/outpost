---
title: "CopilotSettings"
description: "CopilotSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CopilotSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                |
| ---------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `AgentAuthentication \| undefined`              | Optionnel | Formes account uniquement : "account" transmet comme COPILOT_GITHUB_TOKEN le jeton enregistré par copilot login dans ~/.copilot/config.json, key ou variable transmettent un jeton fine-grained. Les formes usage échouent à la composition de l’agent, et les jetons classiques ghp_ sont refusés. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes Copilot, fusionnées par-dessus .outpost/.env ; COPILOT_AUTO_UPDATE vaut false par défaut. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                                                             |
| `conversations`  | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les bundles de session Copilot au lieu du store natif par défaut, par exemple createTransportConversations(createCopilotConversations(), …). Un store qui déclare un autre format est refusé dès la création du harness.                                    |
| `mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP transmis à Copilot avec --additional-mcp-config à chaque exécution, indexés par nom de serveur. Les secrets restent des références ${NAME} résolues par Copilot ; chaque variable référencée doit être déclarée.                                                                       |

## Signature

```ts
export interface CopilotSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
  readonly mcpServers?: McpServers;
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [ConversationStore](../conversationstore/)
- [McpServers](../mcpservers/)
- [Variables](../variables/)
