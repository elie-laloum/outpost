---
title: "createClaudeHarness"
description: "createClaudeHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createClaudeHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le preset CLI Claude Code sans lancer la CLI ; createAgent({ harness, model }) le lie et refuse les réglages non pris en charge. Il capture, reprend et forke les conversations, accepte le pilotage en direct par stream-json, reasoning de low à max et maxOutputTokens.

[Exemple complet et règles détaillées](../../guide/claude-code/).

## Paramètres et propriétés

| Nom                          | Type                                                                                              | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                   | `ClaudeSettings \| undefined`                                                                     | Optionnel | Réglages de Claude Code ; model, reasoning et maxOutputTokens se placent sur createAgent() et sont refusés ici.                                                                                                                                                                                                                                                          |
| `settings.partialMessages`   | `boolean \| undefined`                                                                            | Optionnel | Passe --include-partial-messages aux exécutions non interactives pour que le flux émette des événements text-delta. Les sessions interactives ne changent pas.                                                                                                                                                                                                           |
| `settings.permissions`       | `"plan" \| "default" \| "acceptEdits" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optionnel | Mode de permissions Claude Code transmis avec --permission-mode. Sans lui, les exécutions non interactives passent --dangerously-skip-permissions ; les sessions interactives conservent les demandes d’approbation de la CLI.                                                                                                                                           |
| `settings.authentication`    | `AgentAuthentication \| undefined`                                                                | Optionnel | Choix des identifiants : "account" (connexion d’abonnement), "usage" (clé API), { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Codex refuse account key et variable et n’accepte que usage avec modelProvider ; les formes non prises en charge échouent à la composition de l’agent. En son absence, Outpost n’installe aucun identifiant. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optionnel | Variables d’environnement des commandes de cette CLI, fusionnées par-dessus .outpost/.env ; un nom également défini par le provider de sandbox échoue avec le code configuration. Claude Code refuse ici CLAUDE_CODE_MAX_OUTPUT_TOKENS ou MCP_TIMEOUT quand maxOutputTokens ou startupTimeoutMs les définit déjà.                                                        |
| `settings.saveConversations` | `boolean \| undefined`                                                                            | Optionnel | Enregistre la conversation native après chaque tour, true par défaut. false désactive la capture et ne peut pas être combiné avec conversations.                                                                                                                                                                                                                         |
| `settings.conversations`     | `ConversationStore \| undefined`                                                                  | Optionnel | Store de conversations utilisé à la place du store natif, par exemple createTransportConversations() sur le format de l’agent. Un store d’un autre format, ou saveConversations: false, échoue dès la création du harness.                                                                                                                                               |
| `settings.mcpServers`        | `McpServers \| undefined`                                                                         | Optionnel | Serveurs MCP indexés par nom, transmis en ligne de commande : --mcp-config pour Claude Code, surcharges -c pour Codex. Les secrets restent des références de variables ; une variable référencée non déclarée échoue avant le démarrage de l’agent.                                                                                                                      |
| `settings.profile`           | `AgentProfile \| undefined`                                                                       | Optionnel | Déclaration portable issue de defineAgentProfile(), traduite dans les demandes de Claude Code ou Codex. Les serveurs MCP fusionnent avec mcpServers et les noms en double échouent à la création du harness. Claude applique les listes d’outils intégrés avec un hook de commande et exige dontAsk ; Codex refuse toute liste.                                          |

## Retour

`CliHarness`

## Signature

```ts
export declare function createClaudeHarness(
  settings?: ClaudeSettings,
): CliHarness;
```

## Contrats associés

- [ClaudeSettings](../claudesettings/)
- [CliHarness](../cliharness/)
