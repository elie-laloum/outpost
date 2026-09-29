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

| Nom                 | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ----------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelProvider`     | `CodexModelProvider \| undefined`               | Optionnel | Configuration d’un endpoint de modèle Codex personnalisé ; exige la compatibilité Responses API.                                                                                                                                                                                                                      |
| `approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optionnel | Responsable de l’approbation Codex : utilisateur ou revue automatique.                                                                                                                                                                                                                                                |
| `authentication`    | `AgentAuthentication \| undefined`              | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |
| `saveConversations` | `boolean \| undefined`                          | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                                                                                                                                                                                            |
| `conversations`     | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les sessions de cet agent au lieu du store natif par défaut, par exemple createTransportConversations() au format de l’agent. Le format doit correspondre à l’agent et saveConversations ne doit pas valoir false.                                                            |
| `mcpServers`        | `McpServers \| undefined`                       | Optionnel | Serveurs MCP utilisables par cette CLI, indexés par nom de serveur. Outpost les traduit dans la configuration native de la CLI et ne référence les secrets que par nom de variable ; chaque variable référencée doit être déclarée.                                                                                   |

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
