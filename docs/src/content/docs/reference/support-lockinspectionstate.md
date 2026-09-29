---
title: "LockInspectionState"
description: "LockInspectionState — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name        | Type                                              | Presence          | Meaning                                                                                                                                                       |
| ----------- | ------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ownership` | `LockOwnership \| undefined`                      | Optional          | Whether the recorded process still holds the lock, judged by host, boot, PID namespace and process start time. Rely on it rather than on state.               |
| `state`     | `"present" \| "absent" \| "unknown" \| "skipped"` | Required          | present: a process with the recorded PID exists; absent: none exists; unknown: the file or PID could not be read or probed; skipped: the entry is not a file. |
| `pid`       | `number \| number \| undefined`                   | Variant-dependent | PID read from the lock file, absent when the file or its PID is unreadable.                                                                                   |
| `reason`    | `string \| "NOT_FILE"`                            | Variant-dependent | Why the state is unknown (LOCK_READ_FAILED, INVALID_PID, PID_PROBE_FAILED) or skipped (NOT_FILE).                                                             |

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
