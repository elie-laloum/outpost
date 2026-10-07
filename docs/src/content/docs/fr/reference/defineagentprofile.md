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

[Exemple complet et règles détaillées](../../guide/choose-an-agent/).

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
