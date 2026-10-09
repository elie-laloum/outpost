---
title: "SandboxProvider"
description: "SandboxProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxProvider } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                                                              | Presence | Meaning                                                                                                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaces` | `SandboxWorkspaces \| undefined`                                                  | Optional | Opt-in versioned file resource capability; older providers and checkpoints preserve their Git contract.                                                                                                                                                                   |
| `recover`    | `((resourceId: string, options?: TransferOptions) => Promise<void>) \| undefined` | Optional | Removes a resource recorded through registerRecovery after its coordinator stopped, within signal and deadlineMs. It must succeed when called again and never delete host repository data. Durable speculation requires it; Docker and Podman provide it in mounted mode. |
| `name`       | `string`                                                                          | Required | Identifier recorded in diagnostics and resource activity: docker, podman, local, vercel, daytona or firecracker for the built-in providers.                                                                                                                               |
| `placement`  | `"mounted" \| "remote" \| "host"`                                                 | Required | How the repository reaches the sandbox: mounted (host worktree mounted), remote (history uploaded, changes synchronized back) or host (commands run in the host worktree). Remote placement rejects the current branch mode and defaults to integrate.                    |
| `variables`  | `Readonly<Record<string, string>> \| undefined`                                   | Optional | Environment variables set for every command in the sandbox, as literal values; they override .outpost/.env entries. A key the agent also declares fails with code configuration.                                                                                          |
| `acquire`    | `(context: SandboxContext) => Promise<SandboxLease>`                              | Required | Allocates one environment for a sandbox and returns its lease. Outpost calls it once per sandbox and calls release() when the sandbox closes; honor context.signal.                                                                                                       |

## Signature

```ts
export interface SandboxProvider {
  readonly workspaces?: SandboxWorkspaces;
  readonly recover?: (
    resourceId: string,
    options?: TransferOptions,
  ) => Promise<void>;
  readonly name: string;
  readonly placement: "mounted" | "remote" | "host";
  readonly variables?: Variables;
  acquire(context: SandboxContext): Promise<SandboxLease>;
}
```

## Related contracts

- [SandboxContext](../sandboxcontext/)
- [SandboxLease](../sandboxlease/)
- [SandboxWorkspaces](../sandboxworkspaces/)
- [TransferOptions](../transferoptions/)
- [Variables](../variables/)
