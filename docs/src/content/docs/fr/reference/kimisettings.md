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

| Nom              | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `region`         | `"mainland-cn" \| "global" \| undefined`        | Optionnel | Service du compte : "global" pour kimi.ai (par défaut) ou "mainland-cn" pour kimi.com. Sélectionne le fichier OAuth, les endpoints de compte et la région de connexion dans la sandbox sans copier la configuration hôte. Exige le mode compte lorsqu’une authentification est fournie ; les formes usage refusent une région explicite. Son absence sélectionne global pour les comptes et ne modifie pas l’authentification API. Les endpoints de compte déclarés contradictoires sont refusés, y compris avec la région par défaut. |
| `authentication` | `AgentAuthentication \| undefined`              | Optionnel | Le mode account lit le fichier OAuth de la région choisie et device_id sous ~/.kimi-code ou KIMI_CODE_HOME ; account.file sélectionne un dossier de profil dédié. Les formes usage acceptent KIMI_API_KEY ou une clé/variable explicite et exigent un modèle sur createAgent(). Les formes account.key/variable ne sont pas prises en charge. Son absence ne prépare aucun identifiant.                                                                                                                                                |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `conversations`  | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les bundles de session Kimi au lieu du store natif par défaut, par exemple createTransportConversations("kimi", …). Un store qui déclare un autre format est refusé dès la création du harness.                                                                                                                                                                                                                                                                                                |
| `mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP fusionnés dans .kimi-code/mcp.json du home de l’agent, indexés par nom de serveur ; les autres serveurs du fichier sont conservés. Avec le fournisseur local, c’est votre propre home. Chaque variable référencée doit être déclarée.                                                                                                                                                                                                                                                                                     |

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
