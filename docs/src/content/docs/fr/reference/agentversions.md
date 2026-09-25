---
title: "agentVersions"
description: "agentVersions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **agentVersions**. Consultez le [guide agents](../../guide/agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { agentVersions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Configurer Claude Code, Codex ou Gemini indépendamment du backend de sandbox.

La CLI choisit son modèle si omis. La capture native est activée par défaut pour Claude/Codex. Gemini ne prend en charge que les nouvelles sessions. Identifiants d’agent et de provider sont distincts.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Signature

```ts
export declare const agentVersions: Readonly<{
  gemini: "0.61.0";
  codex: "0.156.1";
  claude: "2.1.280";
}>;
```
