---
title: "CopilotHookOptions"
description: "CopilotHookOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { CopilotHookOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name        | Type                                                                                                                                                                              | Presence          | Meaning                                                                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on`        | `Phase`                                                                                                                                                                           | Required          | Native event name; determines the event payload and permitted response.                                                                                                                                           |
| `name`      | `string \| undefined`                                                                                                                                                             | Optional          | Optional diagnostic name; defaults to the native event name.                                                                                                                                                      |
| `matcher`   | `string \| undefined`                                                                                                                                                             | Optional          | Native matcher, interpreted by the selected CLI. Omit it to receive every occurrence supported by that event.                                                                                                     |
| `timeoutMs` | `number \| undefined`                                                                                                                                                             | Optional          | Positive callback or command deadline in milliseconds; defaults to 30000, at most 600000. Native event time limits still apply.                                                                                   |
| `command`   | `HookCommand \| undefined`                                                                                                                                                        | Variant-dependent | Executable invoked inside the sandbox with native JSON on stdin. Stdout, stderr and exit status retain the CLI’s native meaning. Mutually exclusive with run.                                                     |
| `run`       | `undefined \| (context: AgentHookContext & { readonly event: CopilotHookEvents[Phase]; }) => void \| CopilotHookDecisions[Phase] \| Promise<void \| CopilotHookDecisions[Phase]>` | Variant-dependent | Host callback receiving the native event, a borrowed sandbox and cancellation signal. Return nothing to preserve native behavior; return only decisions supported by this event. Mutually exclusive with command. |

## Signature

```ts
export type CopilotHookOptions<Phase extends CopilotHookPhase> =
  NativeHookOptions<
    Phase,
    CopilotHookEvents[Phase],
    CopilotHookDecisions[Phase]
  >;
```

## Related contracts

- [CopilotHookDecisions](../copilothookdecisions/)
- [CopilotHookEvents](../copilothookevents/)
- [CopilotHookPhase](../copilothookphase/)
- [NativeHookOptions](../support-nativehookoptions/)
