---
title: "createAntigravityHarness"
description: "createAntigravityHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAntigravityHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le preset CLI Antigravity (agy) sans lancer la CLI ; createAgent({ harness, model }) le lie et refuse reasoning et maxOutputTokens. La reprise, les réparations de réponse et le pilotage fonctionnent uniquement dans la même sandbox ouverte ; capture de conversation, reprise à froid et fork sont refusés.

[Exemple complet et règles détaillées](../../guide/antigravity/).

## Paramètres et propriétés

| Nom                       | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `AntigravitySettings \| undefined`              | Optionnel | Réglages d’Antigravity ; model, reasoning et maxOutputTokens se placent sur createAgent() et sont refusés ici, tout comme conversations.                                                                                                                      |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optionnel | "account" ou account.file copie le jeton de connexion Google d’agy depuis ~/.gemini/antigravity-cli ; les formes usage transmettent GEMINI_API_KEY et sélectionnent l’API Gemini. Account key et variable échouent à la composition de l’agent.               |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes agy, fusionnées par-dessus .outpost/.env ; AGY_CLI_DISABLE_AUTO_UPDATE vaut toujours true. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                      |
| `settings.mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP fusionnés dans .gemini/config/mcp_config.json du home de l’agent, indexés par nom de serveur ; les autres serveurs du fichier sont conservés. Avec le fournisseur local, c’est votre propre home. Chaque variable référencée doit être déclarée. |
| `settings.mode`           | `"accept-edits" \| "plan" \| undefined`         | Optionnel | Mode d’exécution Antigravity transmis avec --mode. Sans lui, les exécutions non interactives passent --dangerously-skip-permissions ; les sessions interactives conservent les demandes d’approbation de la CLI.                                              |

## Retour

`CliHarness`

## Signature

```ts
export declare function createAntigravityHarness(
  settings?: AntigravitySettings,
): CliHarness;
```

## Contrats associés

- [AntigravitySettings](../antigravitysettings/)
- [CliHarness](../cliharness/)
