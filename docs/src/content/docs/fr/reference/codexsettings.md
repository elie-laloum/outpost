---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelProvider`     | `CodexModelProvider \| undefined`               | Optionnel | Endpoint personnalisé compatible Responses utilisé à la place d’OpenAI. Il exige un nom de modèle sur createAgent() et n’accepte que l’authentification usage ; les deux sont vérifiés à la composition de l’agent.                                                                                                                                                      |
| `approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optionnel | auto_review confie les demandes d’approbation au relecteur automatique de Codex, avec un accès complet aux fichiers. Sinon, les exécutions non interactives contournent les approbations et les sessions interactives conservent les demandes de la CLI.                                                                                                                 |
| `authentication`    | `AgentAuthentication \| undefined`              | Optionnel | Choix des identifiants : "account" (connexion d’abonnement), "usage" (clé API), { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Codex refuse account key et variable et n’accepte que usage avec modelProvider ; les formes non prises en charge échouent à la composition de l’agent. En son absence, Outpost n’installe aucun identifiant. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes de cette CLI, fusionnées par-dessus .outpost/.env ; un nom également défini par le provider de sandbox échoue avec le code configuration. Claude Code refuse ici CLAUDE_CODE_MAX_OUTPUT_TOKENS ou MCP_TIMEOUT quand maxOutputTokens ou startupTimeoutMs les définit déjà.                                                        |
| `saveConversations` | `boolean \| undefined`                          | Optionnel | Enregistre la conversation native après chaque tour, true par défaut. false désactive la capture et ne peut pas être combiné avec conversations.                                                                                                                                                                                                                         |
| `conversations`     | `ConversationStore \| undefined`                | Optionnel | Store de conversations utilisé à la place du store natif, par exemple createTransportConversations() sur le format de l’agent. Un store d’un autre format, ou saveConversations: false, échoue dès la création du harness.                                                                                                                                               |
| `mcpServers`        | `McpServers \| undefined`                       | Optionnel | Serveurs MCP indexés par nom, transmis en ligne de commande : --mcp-config pour Claude Code, surcharges -c pour Codex. Les secrets restent des références de variables ; une variable référencée non déclarée échoue avant le démarrage de l’agent.                                                                                                                      |

## Signature

```ts
export interface CodexSettings extends CommonAgentSettings {
  readonly modelProvider?: CodexModelProvider;
  readonly approvalReviewer?: "user" | "auto_review";
}
```

## Contrats associés

- [CodexModelProvider](../codexmodelprovider/)
- [CommonAgentSettings](../support-commonagentsettings/)
