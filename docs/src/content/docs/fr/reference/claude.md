---
title: "claude"
description: "claude — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { claude } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit l’adapter Claude Code : préparation des commandes, décodage des événements et stockage des conversations natives. Les réglages de modèle, raisonnement et permissions sont transmis à Claude ; créer l’adapter ne démarre aucun processus et n’authentifie aucun compte.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                          | Type                                                                                              | Présence  | Rôle                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `settings`                   | `ClaudeSettings \| undefined`                                                                     | Optionnel | Réglages Claude de modèle, raisonnement, permissions, environnement et capture de transcripts. |
| `settings.reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| "max" \| undefined`                                    | Optionnel | Niveau d’effort de raisonnement transmis au CLI de l’agent choisi.                             |
| `settings.permissions`       | `"default" \| "acceptEdits" \| "plan" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optionnel | Mode de permissions Claude Code contrôlant l’approbation des outils.                           |
| `settings.model`             | `string \| undefined`                                                                             | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.                                   |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                        |
| `settings.saveConversations` | `boolean \| undefined`                                                                            | Optionnel | Activer la capture native si l’adapter la prend en charge.                                     |

## Retour

`AgentAdapter`

## Signature

```ts
export declare function claude(settings?: ClaudeSettings): AgentAdapter;
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [ClaudeSettings](../claudesettings/)
