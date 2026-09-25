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

## Purpose and behavior

Expose the Claude, Codex and Gemini CLI versions used as compatibility references by bundled protocol fixtures and generated images. These values do not query the installed binaries or prove live account access.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name     | Type        | Presence | Meaning                                                         |
| -------- | ----------- | -------- | --------------------------------------------------------------- |
| `gemini` | `"0.61.0"`  | Required | Gemini CLI version used by the bundled compatibility fixtures.  |
| `codex`  | `"0.156.1"` | Required | Codex CLI version used by the bundled compatibility fixtures.   |
| `claude` | `"2.1.280"` | Required | Claude Code version used by the bundled compatibility fixtures. |

## Signature

```ts
export declare const agentVersions: Readonly<{
  gemini: "0.61.0";
  codex: "0.156.1";
  claude: "2.1.280";
}>;
```
