---
title: "defineAgentProfile"
description: "defineAgentProfile — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineAgentProfile } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare un profil d’agent figé indépendant des CLI sans rien exécuter. Valide les instructions littérales, listes d’outils intégrés autorisés et déclarations MCP ; copie les listes imbriquées et configurations de serveur pour que les modifications ultérieures de l’appelant ne changent pas le profil. Chaque harness traduit la déclaration et refuse les capacités non prises en charge.

Claude ajoute des instructions système et du JSON MCP natif ; Codex utilise developer_instructions et les surcharges TOML MCP, y compris en mode app-server. Copilot, Kimi et Antigravity ajoutent les instructions littérales avant chaque demande, corrections et reprises comprises, avant les instructions de réponse finale. Les profils n’écrivent pas les instructions dans le dépôt et ne modifient pas les identifiants de l’hôte. Les listes Claude utilisent la sélection native d’outils, dontAsk et un hook PreToolUse, avec les réglages utilisateur/projet/local et le MCP hérités désactivés pour la demande. Un mode de permission incompatible échoue à la composition ; les hooks exigent Node.js et une CLI capable de les exécuter dans la sandbox.

[Exemple complet et règles détaillées](../../guide/agent-profiles/).

## Paramètres et propriétés

| Nom                    | Type                                       | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `AgentProfileOptions`                      | Requis    | Instructions littérales, liste portable d’outils intégrés autorisés et déclarations de serveurs MCP à valider et figer ; les champs inconnus échouent avec le code configuration.                                                                                                                                                                                                                           |
| `options.instructions` | `string \| undefined`                      | Optionnel | Instructions littérales non vides, sans NUL. Configuration système/développeur native pour Claude/Codex, préfixe de demande pour les autres CLI et instructions système avant les ajouts du harness pour la boucle intégrée ; aucune expansion de variable ou commande. Les demandes interactives Kimi refusent ce champ.                                                                                   |
| `options.allowedTools` | `readonly AgentProfileTool[] \| undefined` | Optionnel | Capacités distinctes read, edit, shell ou shell:&lt;commande exacte> pour les outils intégrés uniquement. L’absence conserve le comportement existant ; [] refuse tous les outils intégrés. Les déclarations MCP explicites accordent leurs outils séparément. Contrôlée par la boucle intégrée et les hooks de commande Claude ; Codex, Copilot, Kimi et Antigravity refusent toute liste à createAgent(). |
| `options.mcpServers`   | `McpServers \| undefined`                  | Optionnel | Serveurs MCP accordés par ce profil, validés et copiés en profondeur avec références aux variables secrètes et filtres par serveur. Fusionnés avec ceux du harness par nom ; un nom en double échoue à la création du harness et les options non prises en charge par l’adapter échouent à la composition.                                                                                                  |

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
