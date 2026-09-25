---
title: "agentVersions"
description: "agentVersions — Outpost API"
sidebar:
  order: 10
---

Public contract for **agentVersions**. See the [agents guide](../../guide/agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import { agentVersions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Signature

```ts
export declare const agentVersions: Readonly<{
  gemini: "0.61.0";
  codex: "0.156.1";
  claude: "2.1.280";
}>;
```
