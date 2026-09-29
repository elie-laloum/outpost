---
title: "CliAgentOptions"
description: "CliAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name      | Type                     | Presence | Meaning                                                                                                                                                                                                                                     |
| --------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness` | `CliHarness`             | Required | CLI preset, such as createCodexHarness(), bound to model when the agent is created.                                                                                                                                                         |
| `model`   | `ModelSpec \| undefined` | Optional | Model name or { name, reasoning, maxOutputTokens }; the preset rejects unsupported reasoning or maxOutputTokens here. Omitted, the CLI uses its default model, except that Kimi usage authentication and a Codex modelProvider require one. |

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
