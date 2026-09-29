---
title: "KimiSettings"
description: "KimiSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { KimiSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `region`         | `"mainland-cn" \| "global" \| undefined`        | Optionnel | Déploiement du compte Kimi : "global" pour kimi.ai (par défaut) ou "mainland-cn" pour kimi.com, qui sélectionne le fichier OAuth et les endpoints de connexion. Le définir avec l’authentification usage échoue dès la création du harness.                                                                                            |
| `authentication` | `AgentAuthentication \| undefined`              | Optionnel | "account" copie le fichier OAuth de la région et device_id depuis ~/.kimi-code (ou KIMI_CODE_HOME, ou le répertoire de profil account.file) puis exécute kimi login dans la sandbox. Les formes usage transmettent KIMI_API_KEY et exigent un modèle sur createAgent() ; account key et variable échouent à la composition de l’agent. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes Kimi, fusionnées par-dessus .outpost/.env ; KIMI_CODE_NO_AUTO_UPDATE vaut 1 par défaut. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                                                                                                  |
| `conversations`  | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les bundles de session Kimi au lieu du store natif par défaut, par exemple createTransportConversations(createKimiConversations(), …). Un store qui déclare un autre format est refusé dès la création du harness.                                                                             |
| `mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP fusionnés dans .kimi-code/mcp.json du home de l’agent, indexés par nom de serveur ; les autres serveurs du fichier sont conservés. Avec le fournisseur local, c’est votre propre home. Chaque variable référencée doit être déclarée.                                                                                     |

## Signature

```ts
export interface KimiSettings {
  readonly region?: "mainland-cn" | "global";
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
