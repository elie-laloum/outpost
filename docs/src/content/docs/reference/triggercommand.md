---
title: "TriggerCommand"
description: "TriggerCommand — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerCommand } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                     | Presence | Meaning                                                                        |
| ------------ | ---------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `source`     | `"github" \| "gitlab" \| "slack"`        | Required | Sender of the command: github, gitlab or slack.                                |
| `text`       | `string`                                 | Required | Trimmed text after the command; empty when the command has no argument.        |
| `repository` | `string \| undefined`                    | Optional | Repository of the commented issue or request, for GitHub and GitLab comments.  |
| `number`     | `number \| undefined`                    | Optional | Number or IID of the commented issue or request, when the payload provides it. |
| `target`     | `"issue" \| "pull-request" \| undefined` | Optional | issue or pull-request, present with number.                                    |

## Signature

```ts
export interface TriggerCommand {
  readonly source: "github" | "gitlab" | "slack";
  /** Text following the command, trimmed. */
  readonly text: string;
  readonly repository?: string;
  readonly number?: number;
  readonly target?: "issue" | "pull-request";
}
```
