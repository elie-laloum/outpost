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

Crée un harness Codex à partir des réglages d’exécution, d’authentification et de conversation, sans lancer la CLI. Composez-le avec createAgent({ harness, model }) pour sélectionner séparément le modèle. La CLI possède sa boucle interne modèle/outils.

[Exemple complet et règles détaillées](../../guide/harness/).

## Paramètres et propriétés

| Nom                          | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                   | `CodexSettings \| undefined`                    | Optionnel | Configuration du harness Codex ; transmettez le modèle choisi à createAgent().                                                                                                                                                                                                                                        |
| `settings.modelProvider`     | `CodexModelProvider \| undefined`               | Optionnel | Configuration d’un endpoint de modèle Codex personnalisé ; exige la compatibilité Responses API.                                                                                                                                                                                                                      |
| `settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optionnel | Responsable de l’approbation Codex : utilisateur ou revue automatique.                                                                                                                                                                                                                                                |
| `settings.authentication`    | `AgentAuthentication \| undefined`              | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |
| `settings.saveConversations` | `boolean \| undefined`                          | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                                                                                                                                                                                            |
| `settings.conversations`     | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les sessions de cet agent au lieu du store natif par défaut, par exemple createTransportConversations() au format de l’agent. Le format doit correspondre à l’agent et saveConversations ne doit pas valoir false.                                                            |
| `settings.mcpServers`        | `McpServers \| undefined`                       | Optionnel | Serveurs MCP utilisables par cette CLI, indexés par nom de serveur. Outpost les traduit dans la configuration native de la CLI et ne référence les secrets que par nom de variable ; chaque variable référencée doit être déclarée.                                                                                   |

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
