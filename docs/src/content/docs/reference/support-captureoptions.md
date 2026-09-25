---
title: "CaptureOptions"
description: "CaptureOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name    | Type                                       | Presence | Meaning                                                                             |
| ------- | ------------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| `home`  | `string \| undefined`                      | Optional | Host agent home used to locate or persist native transcripts.                       |
| `warn`  | `((message: string) => void) \| undefined` | Optional | Callback receiving nonfatal execution or conversation-storage warnings.             |
| `local` | `boolean \| undefined`                     | Optional | Use host-local transcript access instead of transferring through the sandbox lease. |

## Signature

```ts
export type CaptureOptions = {
  home?: string;
  warn?: (message: string) => void;
  local?: boolean;
};
```
