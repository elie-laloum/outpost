---
title: "FileSandboxSettings"
description: "FileSandboxSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileSandboxSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                      | Presence | Meaning                                                                                                  |
| ------------------- | --------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `hooks`             | `LifecycleHooks \| undefined`                             | Optional | Declared workspaceReady, hostReady and sandboxReady preparation commands.                                |
| `limits`            | `Pick<StageLimits, "copyMs" \| "collectMs"> \| undefined` | Optional | Copy and collection deadlines for file execution; Git preparation and integration limits are refused.    |
| `observation`       | `ObservationHub \| undefined`                             | Optional | Explicit observation hub preserving scoped delivery and synchronous usage accounting.                    |
| `logging`           | `Logging \| undefined`                                    | Optional | Declared execution journal; replayable file effects are refused when reproduction is unsupported.        |
| `activityTransport` | `Transport \| undefined`                                  | Optional | Transport for bounded resource activity observations; liveness does not authorize recovery.              |
| `recoveryTransport` | `Transport \| undefined`                                  | Optional | Explicit Transport retaining sandbox recovery evidence independently of file snapshots.                  |
| `sandboxProvider`   | `SandboxProvider`                                         | Required | Execution provider with the required file binding capability; legacy providers remain usable for Git.    |
| `agent`             | `DispatchAgent \| undefined`                              | Optional | Explicitly composed agent compatible with the selected file execution and conversation capabilities.     |
| `signal`            | `AbortSignal \| undefined`                                | Optional | Cancellation signal propagated to the operation and its process group; reusable sandboxes remain usable. |
| `variables`         | `Readonly<Record<string, string>> \| undefined`           | Optional | Only explicitly declared environment variables reach the sandbox; no implicit .env loading.              |

## Signature

```ts
export interface FileSandboxSettings {
  readonly hooks?: LifecycleHooks;
  readonly limits?: Pick<StageLimits, "copyMs" | "collectMs">;
  readonly observation?: ObservationHub;
  readonly logging?: Logging;
  readonly activityTransport?: Transport;
  readonly recoveryTransport?: Transport;
  readonly sandboxProvider: SandboxProvider;
  readonly agent?: DispatchAgent;
  readonly signal?: AbortSignal;
  readonly variables?: Variables;
}
```

## Related contracts

- [DispatchAgent](../dispatchagent/)
- [SandboxProvider](../sandboxprovider/)
- [Variables](../variables/)
