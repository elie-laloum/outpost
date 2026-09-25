---
title: "CliAgentOptions"
description: "CliAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                                 |
| --------- | --------------------- | -------- | --------------------------------------------------------------------------------------- |
| `harness` | `CliHarness`          | Required | CLI execution preset to bind to the selected model.                                     |
| `model`   | `string \| undefined` | Optional | Nonempty model identifier forwarded unchanged; omission selects the native CLI default. |

## Signature

```ts
export interface CliAgentOptions {
  readonly harness: CliHarness;
  readonly model?: string;
}
```

## Related contracts

- [CliHarness](../cliharness/)
