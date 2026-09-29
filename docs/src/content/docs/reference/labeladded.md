---
title: "labelAdded"
description: "labelAdded — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { labelAdded } from "@elie-laloum/outpost";
```

## Purpose and behavior

Return the repository, number and target when the event adds this label to a GitHub issue or pull request, or to a GitLab issue or merge request; otherwise undefined. It reads only the verified payload and does not check who added the label.

[Complete example and detailed rules](../../guide/webhooks/).

## Parameters and properties

| Name    | Type           | Presence | Meaning                                          |
| ------- | -------------- | -------- | ------------------------------------------------ |
| `event` | `TriggerEvent` | Required | Verified event from a GitHub or GitLab source.   |
| `label` | `string`       | Required | Exact label name that must have just been added. |

## Returns

`TriggerLabel | undefined`

## Signature

```ts
export declare function labelAdded(
  event: TriggerEvent,
  label: string,
): TriggerLabel | undefined;
```

## Related contracts

- [TriggerEvent](../triggerevent/)
- [TriggerLabel](../triggerlabel/)
