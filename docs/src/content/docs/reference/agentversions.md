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

Pinned CLI version of each built-in agent, keyed by agent name. Generated images and remote bootstrap install these versions, and doctor reports them as the reference; reading them does not query the installed binaries.

[Complete example and detailed rules](../../guide/agent-images/).

## Parameters and properties

| Name          | Type     | Presence | Meaning                                                                                                                                                    |
| ------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codex`       | `string` | Required | Codex CLI version installed by generated images and remote bootstrap.                                                                                      |
| `claude`      | `string` | Required | Claude Code version installed by generated images and remote bootstrap.                                                                                    |
| `antigravity` | `string` | Required | Antigravity CLI version installed from SHA-512-verified archives by generated images and remote bootstrap, and used as the doctor compatibility reference. |
| `copilot`     | `string` | Required | GitHub Copilot CLI version installed by generated images and remote bootstrap.                                                                             |
| `kimi`        | `string` | Required | Kimi Code CLI version installed by generated images and remote bootstrap.                                                                                  |

## Signature

```ts
export declare const agentVersions: Readonly<Record<BuiltInAgentName, string>>;
```
