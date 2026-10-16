---
title: "NativeHook"
description: "NativeHook — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name        | Type                                                             | Presence | Meaning                                                                                                                                                                                                           |
| ----------- | ---------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`      | `"native-hook"`                                                  | Required | Factory discriminator identifying a native CLI hook.                                                                                                                                                              |
| `agent`     | `Agent`                                                          | Required | CLI protocol owning this hook; another CLI harness refuses it.                                                                                                                                                    |
| `on`        | `Phase`                                                          | Required | Native event name; determines the event payload and permitted response.                                                                                                                                           |
| `name`      | `string`                                                         | Required | Optional diagnostic name; defaults to the native event name.                                                                                                                                                      |
| `timeoutMs` | `number`                                                         | Required | Positive callback or command deadline in milliseconds; defaults to 30000, at most 600000. Native event time limits still apply.                                                                                   |
| `command`   | `HookCommand \| undefined`                                       | Optional | Executable invoked inside the sandbox with native JSON on stdin. Stdout, stderr and exit status retain the CLI’s native meaning. Mutually exclusive with run.                                                     |
| `matcher`   | `string \| undefined`                                            | Optional | Native matcher, interpreted by the selected CLI. Omit it to receive every occurrence supported by that event.                                                                                                     |
| `run`       | `(event: unknown, context: AgentHookContext) => Promise<string>` | Required | Host callback receiving the native event, a borrowed sandbox and cancellation signal. Return nothing to preserve native behavior; return only decisions supported by this event. Mutually exclusive with command. |

## Signature

```ts
export interface NativeHook<
  Agent extends string,
  Phase extends string = string,
> extends AgentHookHandler {
  readonly kind: "native-hook";
  readonly agent: Agent;
  readonly on: Phase;
}
```

## Related contracts

- [AgentHookHandler](../support-agenthookhandler/)
