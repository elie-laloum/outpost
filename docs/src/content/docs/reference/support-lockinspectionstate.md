---
title: "LockInspectionState"
description: "LockInspectionState — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name        | Type                                              | Presence          | Meaning                                                                    |
| ----------- | ------------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `ownership` | `LockOwnership \| undefined`                      | Optional          | Assessment of whether the recorded local process still owns the resource.  |
| `state`     | `"present" \| "absent" \| "unknown" \| "skipped"` | Required          | Whether the lock file is present, absent, unknown or deliberately skipped. |
| `pid`       | `number \| number \| undefined`                   | Variant-dependent | Process ID parsed from the local lock file when available.                 |
| `reason`    | `string \| "NOT_FILE"`                            | Variant-dependent | Reason the local lock was classified with this ownership state.            |

## Signature

```ts
export type LockInspectionState = {
  readonly ownership?: LockOwnership;
} & (
  | {
      readonly state: "present" | "absent";
      readonly pid: number;
    }
  | {
      readonly state: "unknown";
      readonly reason: string;
      readonly pid?: number;
    }
  | {
      readonly state: "skipped";
      readonly reason: "NOT_FILE";
    }
);
```

## Related contracts

- [LockOwnership](../support-lockownership/)
