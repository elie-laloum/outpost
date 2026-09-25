---
title: "attach"
description: "attach — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { attach } from "@elie-laloum/outpost";
```

## Purpose and behavior

Open a real interactive agent terminal in a newly allocated sandbox, then collect its exit status and commits and close owned resources. Prompt questions can be supplied through ask; terminal attachment does not produce a typed response.

[Complete example and detailed rules](../../guide/environment/commands/).

## Parameters and properties

| Name                         | Type                                                                                                                                                    | Presence | Meaning                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions & AttachOptions & RequiredAgent`                                                                                                        | Required | Workspace, provider, native agent and interactive terminal setup.                                                                                        |
| `options.includeUncommitted` | `boolean \| undefined`                                                                                                                                  | Optional | Include uncommitted host changes when preparing a remote repository snapshot.                                                                            |
| `options.agent`              | `import("../domain/agent.types.ts").CliAgent \| import("../domain/agent.types.ts").CustomAgent`                                                         | Optional | Native coding-agent adapter.                                                                                                                             |
| `options.sandboxProvider`    | `SandboxProvider \| undefined`                                                                                                                          | Optional | Execution environment backend.                                                                                                                           |
| `options.workspace`          | `Workspace \| undefined`                                                                                                                                | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                                                                                      |
| `options.hooks`              | `LifecycleHooks \| undefined`                                                                                                                           | Optional | Lifecycle commands in declared execution order.                                                                                                          |
| `options.signal`             | `AbortSignal \| undefined`                                                                                                                              | Optional | Cooperative cancellation for this operation.                                                                                                             |
| `options.logging`            | `Logging \| undefined`                                                                                                                                  | Optional | Configure the dispatch journal file and verbose event retention.                                                                                         |
| `options.bootstrap`          | `boolean \| undefined`                                                                                                                                  | Optional | Whether to install a missing selected agent automatically.                                                                                               |
| `options.conversationHome`   | `string \| undefined`                                                                                                                                   | Optional | Host home used for native transcript storage.                                                                                                            |
| `options.recoveryTransport`  | `Transport \| undefined`                                                                                                                                | Optional | Publish verified recovery archives before applying downloaded remote changes. Local synchronization staging remains; archives outlive sandbox closure.   |
| `options.activityTransport`  | `Transport \| undefined`                                                                                                                                | Optional | Store sandbox activity records in this transport. Remote ownership remains unverified; PID observations are not used to reclaim another machine’s state. |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`                                                                                                | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory.                                                        |
| `options.repository`         | `string \| undefined`                                                                                                                                   | Optional | Target host Git checkout.                                                                                                                                |
| `options.branch`             | `BranchPolicy \| undefined`                                                                                                                             | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.                                                          |
| `options.copies`             | `readonly string[] \| undefined`                                                                                                                        | Optional | Repository-relative inputs copied into the workspace.                                                                                                    |
| `options.limits`             | `StageLimits \| undefined`                                                                                                                              | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.                                                               |
| `options.label`              | `string \| undefined`                                                                                                                                   | Optional | Human-readable label used in execution reporting.                                                                                                        |
| `options.ask`                | `VariableQuestion \| undefined`                                                                                                                         | Optional | Callback that supplies missing brief variables during interactive attachment.                                                                            |
| `options.brief`              | `Brief \| undefined`                                                                                                                                    | Optional | Literal text or file-based task input.                                                                                                                   |
| `options.continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                                                                        | Optional | Native conversation ID to continue; fork requests a separate conversation derived from it.                                                               |
| `options.terminal`           | `{ readonly input?: import("stream").Readable; readonly output?: import("stream").Writable; readonly error?: import("stream").Writable; } \| undefined` | Optional | Input, output and error streams for real interactive terminal attachment.                                                                                |

## Returns

`Promise<AttachResult>`

## Signature

```ts
export declare function attach(
  options: SandboxOptions & AttachOptions & RequiredAgent,
): Promise<AttachResult>;
```

## Related contracts

- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
