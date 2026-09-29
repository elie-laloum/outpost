---
title: "Logging"
description: "Logging — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Logging } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name          | Type                     | Presence          | Meaning                                                                                                                                                                                                        |
| ------------- | ------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport \| undefined` | Variant-dependent | Persist immutable event segments and a versioned index through this transport. Defaults to createLocalTransport rooted at <repository>/.outpost/storage; read the returned logReference with readJournal.      |
| `verbose`     | `boolean \| undefined`   | Variant-dependent | Include raw protocol observations in the dispatch journal.                                                                                                                                                     |
| `replayable`  | `boolean \| undefined`   | Variant-dependent | Also record each sandbox dispatch’s commits as verified binary patches so createReplayAgent can rebuild them. Opt-in because the journal then contains repository content; failures to record become warnings. |

## Signature

```ts
export type Logging =
  | false
  | "stdout"
  | {
      readonly transporter?: Transport;
      readonly verbose?: boolean;
      readonly replayable?: boolean;
    };
```

## Related contracts

- [Transport](../transport/)
