---
title: "WatchdogOptions"
description: "WatchdogOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WatchdogOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                   | Presence | Meaning                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repetition` | `RepetitionPolicy`                     | Required | Sliding activity window and occurrence threshold for identical tool name/input or identical file-change payloads, compared before redaction.                                                                                                                          |
| `onStuck`    | `"stop" \| "warn" \| StuckInstruction` | Required | Required policy: stop aborts with code stuck; warn emits a warning and continues; an instruction object steers the active loop or resumes its CLI conversation. After the intervention limit, further repetition stops. Detection resets its window after each alert. |

## Signature

```ts
export interface WatchdogOptions {
  readonly repetition: RepetitionPolicy;
  readonly onStuck: "stop" | "warn" | StuckInstruction;
}
```

## Related contracts

- [RepetitionPolicy](../repetitionpolicy/)
- [StuckInstruction](../stuckinstruction/)
