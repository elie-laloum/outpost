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

| Nom                 | Type                                                                                              | Présence  | Rôle                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optionnel | Mode de permissions Claude Code contrôlant l’approbation des outils.                                                                             |
| `authentication`    | `AgentAuthentication \| undefined`                                                                | Optionnel | Préparation explicite de l’authentification de ce harness CLI. Son absence conserve l’accès déjà configuré sans rechercher des credentials hôte. |
| `variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                          |
| `saveConversations` | `boolean \| undefined`                                                                            | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                                                       |

## Signature

```ts
export interface ClaudeSettings extends CommonAgentSettings {
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
