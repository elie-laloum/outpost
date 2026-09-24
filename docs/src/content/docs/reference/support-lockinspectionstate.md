---
title: "LockInspectionState"
description: "LockInspectionState — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

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
