---
title: "agentVersions"
description: "agentVersions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { agentVersions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Expose les versions des CLI Claude, Codex et Gemini servant de références aux fixtures de protocole et aux images générées. Ces valeurs n’interrogent pas les binaires installés et ne prouvent pas l’accès à un compte.

[Exemple complet et règles détaillées](../../guide/agents/adapters/).

## Paramètres et propriétés

| Nom      | Type        | Présence | Rôle                                                                         |
| -------- | ----------- | -------- | ---------------------------------------------------------------------------- |
| `gemini` | `"0.61.0"`  | Requis   | Version du CLI Gemini utilisée par les fixtures de compatibilité intégrées.  |
| `codex`  | `"0.156.1"` | Requis   | Version du CLI Codex utilisée par les fixtures de compatibilité intégrées.   |
| `claude` | `"2.1.280"` | Requis   | Version de Claude Code utilisée par les fixtures de compatibilité intégrées. |

## Signature

```ts
export declare const agentVersions: Readonly<{
  gemini: "0.61.0";
  codex: "0.156.1";
  claude: "2.1.280";
}>;
```
