---
title: "defineCodexHook"
description: "defineCodexHook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineCodexHook } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a native Codex lifecycle hook for its CLI harness. Select a documented event and supply either a host callback or a sandbox command. Callback results are checked against that event’s native schema before delivery. Only generated commands receive trust fingerprints. SessionEnd and Interrupt have a native three-second limit.

[Complete example and detailed rules](../../guide/cli-hooks/).

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                | Type                                                                                                                                                                        | Presence          | Meaning                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `CodexHookOptions<Phase>`                                                                                                                                                   | Required          | Native Codex event, optional matcher and deadline, and exactly one host callback or sandbox command.                                                                                                              |
| `options.on`        | `Phase`                                                                                                                                                                     | Required          | Native event name; determines the event payload and permitted response.                                                                                                                                           |
| `options.name`      | `string \| undefined`                                                                                                                                                       | Optional          | Optional diagnostic name; defaults to the native event name.                                                                                                                                                      |
| `options.matcher`   | `string \| undefined`                                                                                                                                                       | Optional          | Native matcher, interpreted by the selected CLI. Omit it to receive every occurrence supported by that event.                                                                                                     |
| `options.timeoutMs` | `number \| undefined`                                                                                                                                                       | Optional          | Positive callback or command deadline in milliseconds; defaults to 30000, at most 600000. Native event time limits still apply.                                                                                   |
| `options.command`   | `HookCommand \| undefined`                                                                                                                                                  | Variant-dependent | Executable invoked inside the sandbox with native JSON on stdin. Stdout, stderr and exit status retain the CLI’s native meaning. Mutually exclusive with run.                                                     |
| `options.run`       | `undefined \| (context: AgentHookContext & { readonly event: CodexHookEvents[Phase]; }) => void \| CodexHookDecisions[Phase] \| Promise<void \| CodexHookDecisions[Phase]>` | Variant-dependent | Host callback receiving the native event, a borrowed sandbox and cancellation signal. Return nothing to preserve native behavior; return only decisions supported by this event. Mutually exclusive with command. |

## Returns

`CodexHook<Phase>`

## Signature

```ts
export declare function defineCodexHook<Phase extends CodexHookPhase>(
  options: CodexHookOptions<Phase>,
): CodexHook<Phase>;
```

## Related contracts

- [CodexHook](../codexhook/)
- [CodexHookOptions](../codexhookoptions/)
- [CodexHookPhase](../codexhookphase/)
