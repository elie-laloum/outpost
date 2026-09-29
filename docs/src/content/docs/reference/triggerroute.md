---
title: "TriggerRoute"
description: "TriggerRoute — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerRoute } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                                                                                   | Presence | Meaning                                                                                                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`   | `string`                                                                               | Required | Exact request path starting with /, such as /github, of at most 128 letters, digits, dots, underscores, tildes, slashes or hyphens. Unique among routes and part of each job identifier.                                                     |
| `source` | `TriggerSource`                                                                        | Required | Source verifying and normalizing requests on this path.                                                                                                                                                                                      |
| `on`     | `(event: TriggerEvent) => TriggerJob \| undefined \| Promise<TriggerJob \| undefined>` | Required | Map a verified event to a job, or return undefined to ignore it (204); a thrown error or invalid job answers 500. Return promptly and deterministically: senders time out, and the queue refuses a different job for a known delivery (503). |

## Signature

```ts
export interface TriggerRoute {
  /** Exact request path, such as `/github`; part of each job identifier. */
  readonly path: string;
  readonly source: TriggerSource;
  /** Maps a verified event to a job, or `undefined` to ignore it; must return promptly. */
  on(
    event: TriggerEvent,
  ): TriggerJob | undefined | Promise<TriggerJob | undefined>;
}
```

## Related contracts

- [TriggerEvent](../triggerevent/)
- [TriggerJob](../triggerjob/)
- [TriggerSource](../triggersource/)
