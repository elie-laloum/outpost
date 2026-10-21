---
title: "defineCopilotHook"
description: "defineCopilotHook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineCopilotHook } from "@elie-laloum/outpost/core";
```

## Purpose and behavior

Declare a native Copilot lifecycle hook for its CLI harness. Select a documented event and supply either a host callback or a sandbox command. Callback results are checked against that event’s native schema before delivery. COPILOT_HOME must match the sandbox home. userPromptSubmitted command output is ignored; use userPromptTransformed to rewrite the prompt.

[Complete example and detailed rules](../../guide/cli-hooks/).

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                | Type                                                                                                                                                                              | Presence          | Meaning                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `CopilotHookOptions<Phase>`                                                                                                                                                       | Required          | Native Copilot event, optional matcher and deadline, and exactly one host callback or sandbox command.                                                                                                            |
| `options.on`        | `Phase`                                                                                                                                                                           | Required          | Native event name; determines the event payload and permitted response.                                                                                                                                           |
| `options.name`      | `string \| undefined`                                                                                                                                                             | Optional          | Optional diagnostic name; defaults to the native event name.                                                                                                                                                      |
| `options.matcher`   | `string \| undefined`                                                                                                                                                             | Optional          | Native matcher, interpreted by the selected CLI. Omit it to receive every occurrence supported by that event.                                                                                                     |
| `options.timeoutMs` | `number \| undefined`                                                                                                                                                             | Optional          | Positive callback or command deadline in milliseconds; defaults to 30000, at most 600000. Native event time limits still apply.                                                                                   |
| `options.command`   | `HookCommand \| undefined`                                                                                                                                                        | Variant-dependent | Executable invoked inside the sandbox with native JSON on stdin. Stdout, stderr and exit status retain the CLI’s native meaning. Mutually exclusive with run.                                                     |
| `options.run`       | `undefined \| (context: AgentHookContext & { readonly event: CopilotHookEvents[Phase]; }) => void \| CopilotHookDecisions[Phase] \| Promise<void \| CopilotHookDecisions[Phase]>` | Variant-dependent | Host callback receiving the native event, a borrowed sandbox and cancellation signal. Return nothing to preserve native behavior; return only decisions supported by this event. Mutually exclusive with command. |

## Returns

`CopilotHook<Phase>`

## Signature

```ts
export declare function defineCopilotHook<Phase extends CopilotHookPhase>(
  options: CopilotHookOptions<Phase>,
): CopilotHook<Phase>;
```

## Related contracts

- [CopilotHook](../copilothook/)
- [CopilotHookOptions](../copilothookoptions/)
- [CopilotHookPhase](../copilothookphase/)
