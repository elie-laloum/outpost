---
title: "TriggerLabel"
description: "TriggerLabel — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerLabel } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                        | Presence | Meaning                                                                       |
| ------------ | --------------------------- | -------- | ----------------------------------------------------------------------------- |
| `source`     | `"github" \| "gitlab"`      | Required | Sender of the event: github or gitlab.                                        |
| `repository` | `string`                    | Required | owner/name on GitHub, the project path with namespace on GitLab.              |
| `number`     | `number`                    | Required | Issue or pull request number on GitHub, issue or merge request IID on GitLab. |
| `target`     | `"issue" \| "pull-request"` | Required | issue, or pull-request for a GitHub pull request or a GitLab merge request.   |
| `label`      | `string`                    | Required | Label that was added.                                                         |

## Signature

```ts
export interface TriggerLabel {
  readonly source: "github" | "gitlab";
  /** `owner/name` on GitHub, `group/project` on GitLab. */
  readonly repository: string;
  /** Issue or pull request number; merge request IID on GitLab. */
  readonly number: number;
  readonly target: "issue" | "pull-request";
  readonly label: string;
}
```
