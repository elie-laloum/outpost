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

| Name         | Type                                       | Presence | Meaning                                                                                                                                                                                                          |
| ------------ | ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repository` | `string`                                   | Required | Host repository of the task; capture rewrites recorded cwd values to this path.                                                                                                                                  |
| `sandbox`    | `SandboxLease`                             | Required | Execution lease used to transfer transcripts into or out of the agent home.                                                                                                                                      |
| `staging`    | `string`                                   | Required | Host scratch directory for files in transit; temporary copies are removed after each transfer.                                                                                                                   |
| `home`       | `string \| undefined`                      | Optional | Host root of captured conversations, from the conversationHome option. Transcript stores default to the user’s home directory and session bundle stores to the repository.                                       |
| `local`      | `boolean \| undefined`                     | Optional | True when the sandbox runs on the host. Transcript stores then read the transcript from disk instead of running find, and skip a restore into the original checkout unless the record has a transport reference. |
| `warn`       | `((message: string) => void) \| undefined` | Optional | Receives nonfatal warnings, such as a child transcript that could not be captured.                                                                                                                               |

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
