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

| Nom                 | Type                                                                                              | Présence  | Rôle                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| "max" \| undefined`                                    | Optionnel | Niveau d’effort de raisonnement transmis au CLI de l’agent choisi.      |
| `permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optionnel | Mode de permissions Claude Code contrôlant l’approbation des outils.    |
| `model`             | `string \| undefined`                                                                             | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.            |
| `variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes. |
| `saveConversations` | `boolean \| undefined`                                                                            | Optionnel | Activer la capture native si l’adapter la prend en charge.              |

## Signature

```ts
export interface ClaudeSettings extends CommonAgentSettings {
  readonly reasoning?: "low" | "medium" | "high" | "xhigh" | "max";
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
