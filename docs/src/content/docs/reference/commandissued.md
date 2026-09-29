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

Return the text after command on the first line of a newly created GitHub or GitLab comment that is or starts with it, or in a matching Slack slash command; otherwise undefined. Edited comments are ignored, and a command that is not a single word throws. It does not authorize the actor; compare event.actor with an allowlist.

[Complete example and detailed rules](../../guide/webhooks/).

## Parameters and properties

| Name      | Type           | Presence | Meaning                                                                                                                                   |
| --------- | -------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `event`   | `TriggerEvent` | Required | Verified event from a GitHub, GitLab or Slack source.                                                                                     |
| `command` | `string`       | Required | Single word starting the command, such as /outpost; for Slack it must equal the slash command name. A value containing whitespace throws. |

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
