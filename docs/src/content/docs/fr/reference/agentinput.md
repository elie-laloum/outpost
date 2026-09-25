---
title: "AgentInput"
description: "AgentInput — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentInput**. Consultez le [guide agents](../../guide/agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AgentInput } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configurer Claude Code, Codex ou Gemini indépendamment du backend de sandbox.

La CLI choisit son modèle si omis. La capture native est activée par défaut pour Claude/Codex. Gemini ne prend en charge que les nouvelles sessions. Identifiants d’agent et de provider sont distincts.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom            | Type                                                             | Présence  | Rôle                                                                             |
| -------------- | ---------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `text`         | `string \| undefined`                                            | Optionnel | Contenu textuel ; sa provenance dépend de l’opération.                           |
| `interactive`  | `boolean \| undefined`                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
}
```
