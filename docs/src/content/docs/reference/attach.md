---
title: "attach"
description: "attach — Outpost API"
sidebar:
  order: 10
---

Public contract for **attach**. See the [commands and terminal guide](../../guide/environment/commands/) for behavior, defaults and examples.

## Import

```ts
import { attach } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run a process or attach a native interactive agent session with explicit stream ownership.

Command returns nonzero exit statuses; callers must check them. Attach requires a supported interactive provider. Vercel rejects attachment.

[Complete example and detailed rules](../../guide/environment/commands/).

## Parameters and properties

| Name                         | Type                                                                                                 | Presence | Meaning                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions & AttachOptions & RequiredAgent`                                                     | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.includeUncommitted` | `boolean \| undefined`                                                                               | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.agent`              | `AgentAdapter`                                                                                       | Optional | Native coding-agent adapter.                                                             |
| `options.provider`           | `SandboxProvider \| undefined`                                                                       | Optional | Execution environment backend.                                                           |
| `options.workspace`          | `Workspace \| undefined`                                                                             | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                      |
| `options.hooks`              | `LifecycleHooks \| undefined`                                                                        | Optional | Lifecycle commands in declared execution order.                                          |
| `options.signal`             | `AbortSignal \| undefined`                                                                           | Optional | Cooperative cancellation for this operation.                                             |
| `options.logging`            | `Logging \| undefined`                                                                               | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.bootstrap`          | `boolean \| undefined`                                                                               | Optional | Whether to install a missing selected agent automatically.                               |
| `options.conversationHome`   | `string \| undefined`                                                                                | Optional | Host home used for native transcript storage.                                            |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`                                             | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.repository`         | `string \| undefined`                                                                                | Optional | Target host Git checkout.                                                                |
| `options.branch`             | `BranchPolicy \| undefined`                                                                          | Optional | Git workspace policy or resulting branch identity, according to this contract.           |
| `options.copies`             | `readonly string[] \| undefined`                                                                     | Optional | Repository-relative inputs copied into the workspace.                                    |
| `options.limits`             | `StageLimits \| undefined`                                                                           | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.label`              | `string \| undefined`                                                                                | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.ask`                | `VariableQuestion \| undefined`                                                                      | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.brief`              | `Brief \| undefined`                                                                                 | Optional | Literal text or file-based task input.                                                   |
| `options.continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                     | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.terminal`           | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |

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
