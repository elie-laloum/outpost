---
title: "AntigravitySettings"
description: "AntigravitySettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AntigravitySettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                 |
| ---------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `AgentAuthentication \| undefined`              | Optionnel | "account" ou account.file copie le jeton de connexion Google d’agy depuis ~/.gemini/antigravity-cli ; les formes usage transmettent GEMINI_API_KEY et sélectionnent l’API Gemini. Account key et variable échouent à la composition de l’agent.                      |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes agy, fusionnées par-dessus .outpost/.env ; AGY_CLI_DISABLE_AUTO_UPDATE vaut toujours true. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                             |
| `mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP fusionnés dans .gemini/config/mcp_config.json du home de l’agent, indexés par nom de serveur ; les autres serveurs du fichier sont conservés. Avec le fournisseur local, c’est votre propre home. Chaque variable référencée doit être déclarée.        |
| `profile`        | `AgentProfile \| undefined`                     | Optionnel | Déclaration portable issue de defineAgentProfile(), traduite dans les demandes d’Antigravity. Les serveurs MCP fusionnent avec mcpServers et les noms en double échouent à la création du harness. Antigravity refuse toute liste d’outils intégrés à createAgent(). |
| `mode`           | `"accept-edits" \| "plan" \| undefined`         | Optionnel | Mode d’exécution Antigravity transmis avec --mode. Sans lui, les exécutions non interactives passent --dangerously-skip-permissions ; les sessions interactives conservent les demandes d’approbation de la CLI.                                                     |

## Signature

```ts
export interface AntigravitySettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly mcpServers?: McpServers;
  readonly profile?: AgentProfile;
  readonly mode?: "accept-edits" | "plan";
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [AgentProfile](../agentprofile/)
- [McpServers](../mcpservers/)
- [Variables](../variables/)
