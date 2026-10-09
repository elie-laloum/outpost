---
title: "SandboxContext"
description: "SandboxContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                   | Presence | Meaning                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceIdentity` | `string \| undefined`                                  | Optional | Logical namespace and source identity for file cache sharing; Git contexts retain repository identity.                                                                                                                              |
| `registerRecovery`  | `((resourceId: string) => Promise<void>) \| undefined` | Optional | Records a stable resource ID, at most 1024 characters, so recover() can remove the resource after a crash. Outpost supplies it only during durable speculation: await it once before allocating, and do not allocate if it rejects. |
| `repository`        | `string`                                               | Required | Host path of the target Git repository.                                                                                                                                                                                             |
| `directory`         | `string`                                               | Required | Host path of the worktree this sandbox works on; a mounted provider exposes it at the lease root.                                                                                                                                   |
| `gitDirectories`    | `readonly string[]`                                    | Required | Host Git directories the worktree needs, its own first and the common directory last. A mounted provider exposes them so git works in the sandbox.                                                                                  |
| `variables`         | `Readonly<Record<string, string>>`                     | Required | Environment for every command: resolved .outpost/.env values, the provider’s variables and the Git author and committer identity. Agent variables are added per command.                                                            |
| `signal`            | `AbortSignal \| undefined`                             | Optional | Aborts the acquisition; release anything already allocated before rejecting.                                                                                                                                                        |

## Signature

```ts
export interface SandboxContext {
  readonly workspaceIdentity?: string;
  readonly registerRecovery?: (resourceId: string) => Promise<void>;
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [Variables](../variables/)
