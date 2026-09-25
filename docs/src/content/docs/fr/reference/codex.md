---
title: "codex"
description: "codex — Outpost API"
sidebar:
  order: 10
---

Contrat public de **codex**. Consultez le [guide agents](../../guide/agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { codex } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configurer Claude Code, Codex ou Gemini indépendamment du backend de sandbox.

La CLI choisit son modèle si omis. La capture native est activée par défaut pour Claude/Codex. Gemini ne prend en charge que les nouvelles sessions. Identifiants d’agent et de provider sont distincts.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom        | Type                         | Présence  | Rôle                                                                             |
| ---------- | ---------------------------- | --------- | -------------------------------------------------------------------------------- |
| `settings` | `CodexSettings \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Retour

`AgentAdapter`

## Signature

```ts
export declare function codex(settings?: CodexSettings): AgentAdapter;
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [CodexSettings](../codexsettings/)
