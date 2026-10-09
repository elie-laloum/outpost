---
title: "FileIsolatedCommandRequest"
description: "FileIsolatedCommandRequest — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FileIsolatedCommandRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                | Type                                                      | Presence          | Meaning                                                                                                                 |
| ------------------- | --------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `hooks`             | `LifecycleHooks \| undefined`                             | Optional          | Declared workspaceReady, hostReady and sandboxReady preparation commands.                                               |
| `limits`            | `Pick<StageLimits, "copyMs" \| "collectMs"> \| undefined` | Optional          | Copy and collection deadlines for file execution; Git preparation and integration limits are refused.                   |
| `observation`       | `ObservationHub \| undefined`                             | Optional          | Explicit observation hub preserving scoped delivery and synchronous usage accounting.                                   |
| `logging`           | `Logging \| undefined`                                    | Optional          | Declared execution journal; replayable file effects are refused when reproduction is unsupported.                       |
| `activityTransport` | `Transport \| undefined`                                  | Optional          | Transport for bounded resource activity observations; liveness does not authorize recovery.                             |
| `recoveryTransport` | `Transport \| undefined`                                  | Optional          | Explicit Transport retaining sandbox recovery evidence independently of file snapshots.                                 |
| `sandboxProvider`   | `SandboxProvider`                                         | Required          | Execution provider with the required file binding capability; legacy providers remain usable for Git.                   |
| `agent`             | `DispatchAgent \| undefined`                              | Optional          | Explicitly composed agent compatible with the selected file execution and conversation capabilities.                    |
| `signal`            | `AbortSignal \| undefined`                                | Optional          | Cancellation signal propagated to the operation and its process group; reusable sandboxes remain usable.                |
| `variables`         | `Readonly<Record<string, string>> \| undefined`           | Optional          | Only explicitly declared environment variables reach the sandbox; no implicit .env loading.                             |
| `workspace`         | `FileWorkspace \| undefined`                              | Variant-dependent | Open workspace borrowed for this operation; its caller remains responsible for closing it.                              |
| `workspaceSource`   | `undefined \| FileWorkspaceSource`                        | Variant-dependent | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                             |
| `command`           | `Command`                                                 | Required          | Execute the declared command and preserve its actual exit status, cancellation and settled files.                       |
| `outputs`           | `readonly WorkspaceOutputOptions[] \| undefined`          | Optional          | Declared protected publications performed only after successful work and sandbox closure.                               |
| `recovery`          | `FileWorkspaceRecoveryAuthorization \| undefined`         | Variant-dependent | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.               |
| `storageQuota`      | `Omit<StorageReservationOptions, "signal"> \| undefined`  | Variant-dependent | Admission reservation through Transport; coordinates cooperating writers without enforcing a physical disk quota.       |
| `inputs`            | `readonly WorkspaceInput[] \| undefined`                  | Variant-dependent | Explicit file inputs; JSON workflow parameters are never implicitly written to disk.                                    |
| `runtime`           | `WorkspaceRuntimeOptions \| undefined`                    | Variant-dependent | Control directory and logical namespace, separate from the workspace files.                                             |
| `paths`             | `readonly string[] \| undefined`                          | Variant-dependent | Explicit relative path selection; copy selection does not implicitly apply .gitignore.                                  |
| `retention`         | `WorkspaceRetention \| undefined`                         | Variant-dependent | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace. |

## Signature

```ts
export type FileIsolatedCommandRequest = FileSandboxOptions & {
  readonly command: Command;
  readonly outputs?: readonly WorkspaceOutputOptions[];
};
```

## Related contracts

- [Command](../command/)
- [FileSandboxOptions](../filesandboxoptions/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
