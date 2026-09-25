---
title: "gemini"
description: "gemini — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { gemini } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit l’adapter Gemini CLI pour une session neuve. Il décode les événements de texte, outils et usage, sans capture native, reprise, bifurcation ni réparation automatique des réponses. Le modèle et le mode d’approbation configurent l’invocation CLI.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                     | Type                                                        | Présence  | Rôle                                                                      |
| ----------------------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------- |
| `settings`              | `GeminiSettings \| undefined`                               | Optionnel | Réglages Gemini de modèle, mode d’approbation et environnement explicite. |
| `settings.model`        | `string \| undefined`                                       | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.              |
| `settings.variables`    | `Readonly<Record<string, string>> \| undefined`             | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.   |
| `settings.approvalMode` | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optionnel | Mode d’approbation des outils du CLI Gemini.                              |

## Retour

`AgentAdapter`

## Signature

```ts
export declare function gemini(settings?: GeminiSettings): AgentAdapter;
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [GeminiSettings](../geminisettings/)
