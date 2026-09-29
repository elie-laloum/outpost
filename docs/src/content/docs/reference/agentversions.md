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

Expose the Claude Code, Codex, Antigravity, Copilot and Kimi CLI versions pinned for generated images and remote bootstrap and used as compatibility references by doctor and bundled protocol fixtures. Antigravity archives are verified against SHA-512 digests recorded in Outpost. These values do not query the installed binaries or prove live account access.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name          | Type     | Presence | Meaning                                                                                                                                                    |
| ------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codex`       | `string` | Required | Codex CLI version used by the bundled compatibility fixtures.                                                                                              |
| `claude`      | `string` | Required | Claude Code version used by the bundled compatibility fixtures.                                                                                            |
| `antigravity` | `string` | Required | Antigravity CLI version installed from SHA-512-verified archives by generated images and remote bootstrap, and used as the doctor compatibility reference. |
| `copilot`     | `string` | Required | GitHub Copilot CLI version installed by generated images and remote bootstrap.                                                                             |
| `kimi`        | `string` | Required | Kimi Code CLI version installed by generated images and remote bootstrap.                                                                                  |

## Signature

```ts
export declare const agentVersions: Readonly<Record<BuiltInAgentName, string>>;
```
