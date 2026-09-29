---
title: "commandIssued"
description: "commandIssued — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { commandIssued } from "@elie-laloum/outpost";
```

## Purpose and behavior

Return the text following a command in a newly created GitHub or GitLab comment, on the first line that starts with it, or in a matching Slack slash command; otherwise undefined. Edited comments are ignored. It does not authorize the actor; compare event.actor with an allowlist.

[Complete example and detailed rules](../../guide/webhooks/).

## Parameters and properties

| Name      | Type           | Presence | Meaning                                                                                             |
| --------- | -------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `event`   | `TriggerEvent` | Required | Verified event from a GitHub, GitLab or Slack source.                                               |
| `command` | `string`       | Required | Single word starting the command, such as /outpost; for Slack it must equal the slash command name. |

## Returns

`TriggerCommand | undefined`

## Signature

```ts
export declare function commandIssued(
  event: TriggerEvent,
  command: string,
): TriggerCommand | undefined;
```

## Related contracts

- [TriggerCommand](../triggercommand/)
- [TriggerEvent](../triggerevent/)
