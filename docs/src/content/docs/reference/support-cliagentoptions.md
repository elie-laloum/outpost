---
title: "CliAgentOptions"
description: "CliAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type                     | Presence | Meaning                                                                                                                                                                                                               |
| --------- | ------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness` | `CliHarness`             | Required | CLI execution preset to bind to the selected model.                                                                                                                                                                   |
| `model`   | `ModelSpec \| undefined` | Optional | Model name, or an AgentModel object with optional reasoning and output limit. The executing harness or provider validates supported values when the agent is composed. Omission selects the native CLI default model. |

## Signature

```ts
export interface CliAgentOptions {
  readonly harness: CliHarness;
  readonly model?: ModelSpec;
}
```

## Related contracts

- [CliHarness](../cliharness/)
- [ModelSpec](../modelspec/)
