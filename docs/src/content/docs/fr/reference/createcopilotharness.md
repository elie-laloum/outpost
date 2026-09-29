---
title: "createCopilotHarness"
description: "createCopilotHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCopilotHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le preset GitHub Copilot CLI sans lancer la CLI ; createAgent({ harness, model }) le lie et refuse reasoning et maxOutputTokens. Il capture et reprend des bundles de session, se pilote en arrêtant puis en reprenant le tour, et refuse le fork. L’usage est rapporté par message, puis en total de session lu après la sortie.

[Exemple complet et règles détaillées](../../guide/copilot-cli/).

## Paramètres et propriétés

| Nom                       | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                |
| ------------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `CopilotSettings \| undefined`                  | Optionnel | Réglages de GitHub Copilot CLI ; model, reasoning et maxOutputTokens se placent sur createAgent() et sont refusés ici.                                                                                                                                                                              |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optionnel | Formes account uniquement : "account" transmet comme COPILOT_GITHUB_TOKEN le jeton enregistré par copilot login dans ~/.copilot/config.json, key ou variable transmettent un jeton fine-grained. Les formes usage échouent à la composition de l’agent, et les jetons classiques ghp_ sont refusés. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes Copilot, fusionnées par-dessus .outpost/.env ; COPILOT_AUTO_UPDATE vaut false par défaut. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                                                             |
| `settings.conversations`  | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les bundles de session Copilot au lieu du store natif par défaut, par exemple createTransportConversations(createCopilotConversations(), …). Un store qui déclare un autre format est refusé dès la création du harness.                                    |
| `settings.mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP transmis à Copilot avec --additional-mcp-config à chaque exécution, indexés par nom de serveur. Les secrets restent des références ${NAME} résolues par Copilot ; chaque variable référencée doit être déclarée.                                                                       |

## Retour

`CliHarness`

## Signature

```ts
export declare function createCopilotHarness(
  settings?: CopilotSettings,
): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [CopilotSettings](../copilotsettings/)
