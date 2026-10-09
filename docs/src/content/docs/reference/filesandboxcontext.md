---
title: "FileSandboxContext"
description: "FileSandboxContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileSandboxContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                                   | Presence | Meaning                                                                                                             |
| ------------------ | ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `workspace`        | `FileWorkspaceRecord`                                  | Required | Open workspace borrowed for this operation; its caller remains responsible for closing it.                          |
| `runtime`          | `WorkspaceRuntime`                                     | Required | Control directory and logical namespace, separate from the workspace files.                                         |
| `variables`        | `Readonly<Record<string, string>>`                     | Required | Only explicitly declared environment variables reach the sandbox; no implicit .env loading.                         |
| `signal`           | `AbortSignal \| undefined`                             | Optional | Cancellation signal propagated to the operation and its process group; reusable sandboxes remain usable.            |
| `registerRecovery` | `((resourceId: string) => Promise<void>) \| undefined` | Optional | Register the provider resource identity before acquisition finishes, so interrupted allocation remains inspectable. |

## Signature

```ts
export interface FileSandboxContext {
  readonly workspace: FileWorkspaceRecord;
  readonly runtime: WorkspaceRuntime;
  readonly variables: Variables;
  readonly signal?: AbortSignal;
  readonly registerRecovery?: (resourceId: string) => Promise<void>;
}
```

## Related contracts

- [FileWorkspaceRecord](../fileworkspacerecord/)
- [Variables](../variables/)
- [WorkspaceRuntime](../workspaceruntime/)
