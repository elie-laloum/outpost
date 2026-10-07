---
title: "createCodexHarness"
description: "createCodexHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCodexHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le preset CLI Codex sans lancer la CLI ; createAgent({ harness, model }) le lie et refuse les réglages non pris en charge. Il capture, reprend et forke les conversations, accepte le pilotage en direct par codex app-server et reasoning de low à max, et refuse maxOutputTokens.

[Exemple complet et règles détaillées](../../guide/codex/).

## Paramètres et propriétés

| Nom                          | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                   | `CodexSettings \| undefined`                    | Optionnel | Réglages de Codex ; model, reasoning et maxOutputTokens se placent sur createAgent() et sont refusés ici.                                                                                                                                                                                                                                                                |
| `settings.modelProvider`     | `CodexModelProvider \| undefined`               | Optionnel | Endpoint personnalisé compatible Responses utilisé à la place d’OpenAI. Il exige un nom de modèle sur createAgent() et n’accepte que l’authentification usage ; les deux sont vérifiés à la composition de l’agent.                                                                                                                                                      |
| `settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optionnel | auto_review confie les demandes d’approbation au relecteur automatique de Codex, avec un accès complet aux fichiers. Sinon, les exécutions non interactives contournent les approbations et les sessions interactives conservent les demandes de la CLI.                                                                                                                 |
| `settings.authentication`    | `AgentAuthentication \| undefined`              | Optionnel | Choix des identifiants : "account" (connexion d’abonnement), "usage" (clé API), { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Codex refuse account key et variable et n’accepte que usage avec modelProvider ; les formes non prises en charge échouent à la composition de l’agent. En son absence, Outpost n’installe aucun identifiant. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes de cette CLI, fusionnées par-dessus .outpost/.env ; un nom également défini par le provider de sandbox échoue avec le code configuration. Claude Code refuse ici CLAUDE_CODE_MAX_OUTPUT_TOKENS ou MCP_TIMEOUT quand maxOutputTokens ou startupTimeoutMs les définit déjà.                                                        |
| `settings.saveConversations` | `boolean \| undefined`                          | Optionnel | Enregistre la conversation native après chaque tour, true par défaut. false désactive la capture et ne peut pas être combiné avec conversations.                                                                                                                                                                                                                         |
| `settings.conversations`     | `ConversationStore \| undefined`                | Optionnel | Store de conversations utilisé à la place du store natif, par exemple createTransportConversations() sur le format de l’agent. Un store d’un autre format, ou saveConversations: false, échoue dès la création du harness.                                                                                                                                               |
| `settings.mcpServers`        | `McpServers \| undefined`                       | Optionnel | Serveurs MCP indexés par nom, transmis en ligne de commande : --mcp-config pour Claude Code, surcharges -c pour Codex. Les secrets restent des références de variables ; une variable référencée non déclarée échoue avant le démarrage de l’agent.                                                                                                                      |
| `settings.profile`           | `AgentProfile \| undefined`                     | Optionnel | Déclaration portable issue de defineAgentProfile(), traduite dans les demandes de Claude Code ou Codex. Les serveurs MCP fusionnent avec mcpServers et les noms en double échouent à la création du harness. Claude applique les listes d’outils intégrés avec un hook de commande et exige dontAsk ; Codex refuse toute liste.                                          |

## Retour

`CliHarness`

## Signature

```ts
export declare function createCodexHarness(
  settings?: CodexSettings,
): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [CodexSettings](../codexsettings/)
