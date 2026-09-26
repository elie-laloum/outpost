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

Expose the Claude Code, Codex, Copilot and Kimi CLI versions pinned for generated images and remote bootstrap and used as compatibility references by bundled protocol fixtures. Antigravity has no entry: its official install script installs the current release. These values do not query the installed binaries or prove live account access.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name      | Type        | Presence | Meaning                                                                        |
| --------- | ----------- | -------- | ------------------------------------------------------------------------------ |
| `codex`   | `"0.156.1"` | Required | Codex CLI version used by the bundled compatibility fixtures.                  |
| `claude`  | `"2.1.280"` | Required | Claude Code version used by the bundled compatibility fixtures.                |
| `copilot` | `"1.0.88"`  | Required | GitHub Copilot CLI version installed by generated images and remote bootstrap. |
| `kimi`    | `"2.1.1"`   | Required | Kimi Code CLI version installed by generated images and remote bootstrap.      |

## Signature

```ts
export declare const agentVersions: Readonly<{
  codex: "0.156.1";
  claude: "2.1.280";
  copilot: "1.0.88";
  kimi: "2.1.1";
}>;
```
