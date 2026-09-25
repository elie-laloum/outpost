---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Configurer Claude Code, Codex ou Gemini indépendamment du backend de sandbox.

La CLI choisit son modèle si omis. La capture native est activée par défaut pour Claude/Codex. Gemini ne prend en charge que les nouvelles sessions. Identifiants d’agent et de provider sont distincts.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom                 | Type                                            | Présence  | Rôle                                                                    |
| ------------------- | ----------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `model`             | `string \| undefined`                           | Optionnel | Identifiant de modèle natif ; disponibilité selon le compte.            |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes. |
| `saveConversations` | `boolean \| undefined`                          | Optionnel | Activer la capture native si l’adapter la prend en charge.              |

## Signature

```ts
export interface CommonAgentSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
```

## Contrats associés

- [Variables](../variables/)
