---
title: "AgentProfileOptions"
description: "AgentProfileOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentProfileOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                       | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------- | ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instructions` | `string \| undefined`                      | Optionnel | Instructions littérales non vides, sans NUL. Configuration système/développeur native pour Claude/Codex, préfixe de demande pour les autres CLI et instructions système avant les ajouts du harness pour la boucle intégrée ; aucune expansion de variable ou commande. Les demandes interactives Kimi refusent ce champ.                                                                                   |
| `allowedTools` | `readonly AgentProfileTool[] \| undefined` | Optionnel | Capacités distinctes read, edit, shell ou shell:&lt;commande exacte> pour les outils intégrés uniquement. L’absence conserve le comportement existant ; [] refuse tous les outils intégrés. Les déclarations MCP explicites accordent leurs outils séparément. Contrôlée par la boucle intégrée et les hooks de commande Claude ; Codex, Copilot, Kimi et Antigravity refusent toute liste à createAgent(). |
| `mcpServers`   | `McpServers \| undefined`                  | Optionnel | Serveurs MCP accordés par ce profil, validés et copiés en profondeur avec références aux variables secrètes et filtres par serveur. Fusionnés avec ceux du harness par nom ; un nom en double échoue à la création du harness et les options non prises en charge par l’adapter échouent à la composition.                                                                                                  |

## Signature

```ts
export interface AgentProfileOptions {
  readonly instructions?: string;
  readonly allowedTools?: readonly AgentProfileTool[];
  readonly mcpServers?: McpServers;
}
```

## Contrats associés

- [AgentProfileTool](../agentprofiletool/)
- [McpServers](../mcpservers/)
