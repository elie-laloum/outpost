---
title: "ConversationContext"
description: "ConversationContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                       | Presence | Meaning                                                                             |
| ------------ | ------------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| `repository` | `string`                                   | Required | Target host Git checkout.                                                           |
| `sandbox`    | `SandboxLease`                             | Required | Execution lease used to transfer transcripts into or out of the agent home.         |
| `staging`    | `string`                                   | Required | Host directory receiving captured or prepared transcript files.                     |
| `home`       | `string \| undefined`                      | Optional | Host agent home used to locate or persist native transcripts.                       |
| `local`      | `boolean \| undefined`                     | Optional | Use host-local transcript access instead of transferring through the sandbox lease. |
| `warn`       | `((message: string) => void) \| undefined` | Optional | Callback receiving nonfatal execution or conversation-storage warnings.             |

## Signature

```ts
export interface ConversationContext {
  readonly repository: string;
  readonly sandbox: SandboxLease;
  readonly staging: string;
  readonly home?: string;
  readonly local?: boolean;
  readonly warn?: (message: string) => void;
}
```

## Related contracts

- [SandboxLease](../sandboxlease/)
