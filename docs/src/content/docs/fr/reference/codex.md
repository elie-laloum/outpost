---
title: "codex"
description: "codex — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { codex } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit l’adapter Codex CLI avec décodage des événements, capture native et continuation des conversations. modelProvider sélectionne un endpoint explicitement compatible Responses. La création configure l’exécution ; les identifiants doivent être disponibles dans l’environnement choisi.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                          | Type                                                  | Présence  | Rôle                                                                                                       |
| ---------------------------- | ----------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `settings`                   | `CodexSettings \| undefined`                          | Optionnel | Réglages Codex de modèle, provider Responses, raisonnement, revue d’approbation et capture de transcripts. |
| `settings.modelProvider`     | `CodexModelProvider \| undefined`                     | Optionnel | Configuration d’un endpoint de modèle Codex personnalisé ; exige la compatibilité Responses API.           |
| `settings.reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| undefined` | Optionnel | Niveau d’effort de raisonnement transmis au CLI de l’agent choisi.                                         |
| `settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`                | Optionnel | Responsable de l’approbation Codex : utilisateur ou revue automatique.                                     |
| `settings.model`             | `string \| undefined`                                 | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.                                               |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`       | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                    |
| `settings.saveConversations` | `boolean \| undefined`                                | Optionnel | Activer la capture native si l’adapter la prend en charge.                                                 |

## Retour

`AgentAdapter`

## Signature

```ts
export declare function codex(settings?: CodexSettings): AgentAdapter;
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [CodexSettings](../codexsettings/)
