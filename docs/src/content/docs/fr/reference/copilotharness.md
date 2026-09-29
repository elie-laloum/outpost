---
title: "copilotHarness"
description: "copilotHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { copilotHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un harness GitHub Copilot CLI à partir des réglages d’exécution, d’authentification et de permissions, sans lancer la CLI. Composez-le avec agent({ harness, model }) pour sélectionner séparément un nom de modèle ; reasoning et maxOutputTokens sont refusés. Les bundles natifs permettent capture, reprise à chaud/à froid et réparations. Le fork automatisé est refusé. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                       | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `CopilotSettings \| undefined`                  | Optionnel | Configuration du harness GitHub Copilot CLI ; transmettez le modèle choisi à agent().                                                                                                                                                                                                                                 |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |
| `settings.conversations`  | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les bundles de session Copilot au lieu du store natif par défaut, par exemple transportConversations("copilot", …). Un store qui déclare un autre format est refusé dès la création du harness.                                                                               |
| `settings.mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP transmis à Copilot avec --additional-mcp-config à chaque exécution, indexés par nom de serveur. Les secrets restent des références ${NAME} résolues par Copilot ; chaque variable référencée doit être déclarée.                                                                                         |

## Retour

`CliHarness`

## Signature

```ts
export declare function copilotHarness(settings?: CopilotSettings): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [CopilotSettings](../copilotsettings/)
