---
title: "AntigravityHookOptions"
description: "AntigravityHookOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AntigravityHookOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name        | Type                                                                                                                                                                                          | Presence          | Meaning                                                                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on`        | `Phase`                                                                                                                                                                                       | Required          | Native event name; determines the event payload and permitted response.                                                                                                                                           |
| `name`      | `string \| undefined`                                                                                                                                                                         | Optional          | Optional diagnostic name; defaults to the native event name.                                                                                                                                                      |
| `matcher`   | `string \| undefined`                                                                                                                                                                         | Optional          | Native matcher, interpreted by the selected CLI. Omit it to receive every occurrence supported by that event.                                                                                                     |
| `timeoutMs` | `number \| undefined`                                                                                                                                                                         | Optional          | Positive callback or command deadline in milliseconds; defaults to 30000, at most 600000. Native event time limits still apply.                                                                                   |
| `command`   | `HookCommand \| undefined`                                                                                                                                                                    | Variant-dependent | Executable invoked inside the sandbox with native JSON on stdin. Stdout, stderr and exit status retain the CLI’s native meaning. Mutually exclusive with run.                                                     |
| `run`       | `undefined \| (context: AgentHookContext & { readonly event: AntigravityHookEvents[Phase]; }) => void \| AntigravityHookDecisions[Phase] \| Promise<void \| AntigravityHookDecisions[Phase]>` | Variant-dependent | Host callback receiving the native event, a borrowed sandbox and cancellation signal. Return nothing to preserve native behavior; return only decisions supported by this event. Mutually exclusive with command. |

## Signature

```ts
export type AntigravityHookOptions<Phase extends AntigravityHookPhase> =
  NativeHookOptions<
    Phase,
    AntigravityHookEvents[Phase],
    AntigravityHookDecisions[Phase]
  >;
```

## Related contracts

- [AntigravityHookDecisions](../antigravityhookdecisions/)
- [AntigravityHookEvents](../antigravityhookevents/)
- [AntigravityHookPhase](../antigravityhookphase/)
- [NativeHookOptions](../support-nativehookoptions/)
