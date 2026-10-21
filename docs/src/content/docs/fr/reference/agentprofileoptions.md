---
title: "AgentProfileOptions"
description: "AgentProfileOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentProfileOptions } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom            | Type                                       | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks`        | `AgentProfileHooks \| undefined`           | Optionnel | Hooks regroupés par harness. Chaque harness sélectionne sa section et la place avant les hooks locaux ; les autres sections sont ignorées. Une liste locale vide conserve les hooks du profil. Outpost suit l’ordre de déclaration ; les CLI conservent leur ordonnancement natif.                                                                                                                                                                                                                       |
| `instructions` | `string \| undefined`                      | Optionnel | Instructions littérales non vides, sans NUL. Configuration système/développeur native pour Claude/Codex, préfixe de demande pour les autres CLI et instructions système avant les ajouts du harness pour la boucle intégrée ; aucune expansion de variable ou commande. Les demandes interactives Kimi refusent ce champ.                                                                                                                                                                                |
| `allowedTools` | `readonly AgentProfileTool[] \| undefined` | Optionnel | Capacités distinctes read, edit, shell ou shell:&lt;commande exacte>. L’absence conserve le comportement existant ; [] refuse les outils intégrés d’action. La boucle intégrée autorise toujours load_skill et les outils, ressources et prompts MCP déclarés, sous réserve des permissions supplémentaires. Charger un skill n’autorise jamais ses outils. Contrôlée par la boucle intégrée et les hooks de commande Claude ; Codex, Copilot, Kimi et Antigravity refusent toute liste à createAgent(). |
| `mcpServers`   | `McpServers \| undefined`                  | Optionnel | Serveurs MCP accordés par ce profil, validés et copiés en profondeur avec références aux variables secrètes et filtres par serveur. Fusionnés avec ceux du harness par nom ; un nom en double échoue à la création du harness et les options non prises en charge par l’adapter échouent à la composition.                                                                                                                                                                                               |

## Signature

```ts
export interface AgentProfileOptions {
  readonly hooks?: AgentProfileHooks;
  readonly instructions?: string;
  readonly allowedTools?: readonly AgentProfileTool[];
  readonly mcpServers?: McpServers;
}
```

## Contrats associés

- [AgentProfileHooks](../agentprofilehooks/)
- [AgentProfileTool](../agentprofiletool/)
- [McpServers](../mcpservers/)
