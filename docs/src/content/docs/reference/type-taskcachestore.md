---
title: "TaskCacheStore"
description: "TaskCacheStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheStore } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                                                                                              | Presence | Meaning                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `read`  | `(fingerprint: string, options?: TaskCacheAccessOptions) => Promise<TaskCacheEntry \| undefined>` | Required | Return the valid entry stored for a fingerprint, or undefined when none exists. The workflow validates the entry again and treats errors as a miss. |
| `write` | `(entry: TaskCacheEntry, options?: TaskCacheAccessOptions) => Promise<void>`                      | Required | Persist an entry for its fingerprint, replacing an older one; a failure is reported as a failed cache event without changing the task outcome.      |

## Signature

```ts
export interface TaskCacheStore {
  read(
    fingerprint: string,
    options?: TaskCacheAccessOptions,
  ): Promise<TaskCacheEntry | undefined>;
  write(entry: TaskCacheEntry, options?: TaskCacheAccessOptions): Promise<void>;
}
```

## Related contracts

- [TaskCacheAccessOptions](../taskcacheaccessoptions/)
- [TaskCacheEntry](../taskcacheentry/)
