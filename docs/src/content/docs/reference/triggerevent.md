---
title: "TriggerEvent"
description: "TriggerEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                  | Presence | Meaning                                                                                                                                  |
| ------------ | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `source`     | `string`              | Required | Source name, such as github, gitlab, slack or standard.                                                                                  |
| `delivery`   | `string`              | Required | Sender delivery identifier, shared by retries of one delivery; 1 to 200 visible ASCII characters.                                        |
| `kind`       | `string`              | Required | Event type: the GitHub event name, the GitLab object_kind, command or the Slack interaction type, or the Standard Webhooks payload type. |
| `action`     | `string \| undefined` | Optional | Sub-action when the sender provides one, such as labeled, update or the Slack command name.                                              |
| `actor`      | `string \| undefined` | Optional | Sender-authenticated identity such as github:octocat, gitlab:user or slack:U123; not an Outpost gate actor.                              |
| `payload`    | `WorkflowJson`        | Required | Parsed request payload; read it with helpers or narrow it before use.                                                                    |
| `receivedAt` | `string`              | Required | ISO time at which the server verified the request.                                                                                       |

## Signature

```ts
export interface TriggerEvent {
  readonly source: string;
  /** Sender delivery identifier; retries of one delivery share it. */
  readonly delivery: string;
  readonly kind: string;
  readonly action?: string;
  /** Sender-authenticated identity such as `github:octocat`; not an Outpost actor. */
  readonly actor?: string;
  readonly payload: WorkflowJson;
  readonly receivedAt: string;
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
