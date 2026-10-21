---
title: "defineAgentProfile"
description: "defineAgentProfile — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineAgentProfile } from "@elie-laloum/outpost/core";
```

## Rôle et comportement

Déclare des instructions réutilisables, des restrictions d’outils, des serveurs MCP et des hooks regroupés par harness. La validation copie et fige les déclarations sans allouer de sandbox ni lire de credentials. Chaque harness utilise uniquement sa section de hooks, avant ses hooks locaux.

[Exemple complet et règles détaillées](../../guide/agent-profiles/).

## Paramètres et propriétés

| Nom                    | Type                                       | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `AgentProfileOptions`                      | Requis    | Instructions littérales, liste portable d’outils autorisés, serveurs MCP et hooks propres à chaque harness à valider et figer ; les champs inconnus échouent avec le code configuration.                                                                                                                                                                                                                                                                                                                 |
| `options.hooks`        | `AgentProfileHooks \| undefined`           | Optionnel | Hooks regroupés par harness. Chaque harness sélectionne sa section et la place avant les hooks locaux ; les autres sections sont ignorées. Une liste locale vide conserve les hooks du profil. Outpost suit l’ordre de déclaration ; les CLI conservent leur ordonnancement natif.                                                                                                                                                                                                                       |
| `options.instructions` | `string \| undefined`                      | Optionnel | Instructions littérales non vides, sans NUL. Configuration système/développeur native pour Claude/Codex, préfixe de demande pour les autres CLI et instructions système avant les ajouts du harness pour la boucle intégrée ; aucune expansion de variable ou commande. Les demandes interactives Kimi refusent ce champ.                                                                                                                                                                                |
| `options.allowedTools` | `readonly AgentProfileTool[] \| undefined` | Optionnel | Capacités distinctes read, edit, shell ou shell:&lt;commande exacte>. L’absence conserve le comportement existant ; [] refuse les outils intégrés d’action. La boucle intégrée autorise toujours load_skill et les outils, ressources et prompts MCP déclarés, sous réserve des permissions supplémentaires. Charger un skill n’autorise jamais ses outils. Contrôlée par la boucle intégrée et les hooks de commande Claude ; Codex, Copilot, Kimi et Antigravity refusent toute liste à createAgent(). |
| `options.mcpServers`   | `McpServers \| undefined`                  | Optionnel | Serveurs MCP accordés par ce profil, validés et copiés en profondeur avec références aux variables secrètes et filtres par serveur. Fusionnés avec ceux du harness par nom ; un nom en double échoue à la création du harness et les options non prises en charge par l’adapter échouent à la composition.                                                                                                                                                                                               |

## Retour

`AgentProfile`

## Signature

```ts
export declare function defineAgentProfile(
  options: AgentProfileOptions,
): AgentProfile;
```

## Contrats associés

- [AgentProfile](../agentprofile/)
- [AgentProfileOptions](../agentprofileoptions/)
