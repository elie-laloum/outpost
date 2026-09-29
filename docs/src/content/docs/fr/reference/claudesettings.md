---
title: "ClaudeSettings"
description: "ClaudeSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ClaudeSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                                                                              | Présence  | Rôle                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `partialMessages`   | `boolean \| undefined`                                                                            | Optionnel | Active les messages partiels Claude non interactifs et les événements text-delta normalisés ; les requêtes interactives restent inchangées.                                                                                                                                                                           |
| `permissions`       | `"plan" \| "default" \| "acceptEdits" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optionnel | Mode de permissions Claude Code contrôlant l’approbation des outils.                                                                                                                                                                                                                                                  |
| `authentication`    | `AgentAuthentication \| undefined`                                                                | Optionnel | Authentification explicite de ce harness CLI : "account", "usage", { account: { file \| key \| variable } } ou { usage: { key \| variable } }. Les formes non prises en charge échouent à la composition de l’agent. Son absence ne prépare rien et conserve l’accès déjà configuré dans l’environnement d’exécution. |
| `variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                               |
| `saveConversations` | `boolean \| undefined`                                                                            | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                                                                                                                                                                                            |
| `conversations`     | `ConversationStore \| undefined`                                                                  | Optionnel | Store qui capture, localise et restaure les sessions de cet agent au lieu du store natif par défaut, par exemple transportConversations() au format de l’agent. Le format doit correspondre à l’agent et saveConversations ne doit pas valoir false.                                                                  |
| `mcpServers`        | `McpServers \| undefined`                                                                         | Optionnel | Serveurs MCP utilisables par cette CLI, indexés par nom de serveur. Outpost les traduit dans la configuration native de la CLI et ne référence les secrets que par nom de variable ; chaque variable référencée doit être déclarée.                                                                                   |

## Signature

```ts
export interface ClaudeSettings extends CommonAgentSettings {
  readonly partialMessages?: boolean;
  readonly permissions?:
    | "default"
    | "acceptEdits"
    | "plan"
    | "auto"
    | "dontAsk"
    | "bypassPermissions";
}
```

## Contrats associés

- [CommonAgentSettings](../support-commonagentsettings/)
