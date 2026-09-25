---
title: "CustomAgent"
description: "CustomAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomAgent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                  | Presence | Meaning                                                                                               |
| ----------------------- | ----------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `resumable`             | `false`                                               | Required | Always false: custom callbacks have no native conversation continuation or automatic response repair. |
| `capture`               | `false`                                               | Required | Always false: the custom runner does not capture native transcripts.                                  |
| `kind`                  | `"custom"`                                            | Required | Execution discriminator: custom.                                                                      |
| `harness`               | `CustomHarness`                                       | Required | Custom callback harness with its configured model provider.                                           |
| `model`                 | `string`                                              | Required | Required nonempty model identifier passed to the provider; availability is checked by the service.    |
| `name`                  | `string`                                              | Required | Native agent identifier used in execution events and diagnostics.                                     |
| `bootstrap`             | `string \| undefined`                                 | Optional | Shell recipe that installs the native CLI when bootstrapping is enabled.                              |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optional | Require the native finished protocol event before treating an agent turn as complete.                 |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optional | Explicit environment declarations; values are strings.                                                |
| `conversations`         | `"codex" \| "claude" \| undefined`                    | Optional | Built-in native transcript format used when no custom storage is supplied.                            |
| `storage`               | `ConversationStore \| undefined`                      | Optional | Custom conversation persistence implementation for this adapter.                                      |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optional | Parse a native transcript to recover token usage when available.                                      |

## Signature

```ts
export interface CustomAgent extends AgentFeatures {
  readonly resumable: false;
  readonly capture: false;
  readonly kind: "custom";
  readonly harness: CustomHarness;
  readonly model: string;
}
```

## Related contracts

- [AgentFeatures](../support-agentfeatures/)
- [CustomHarness](../type-customharness/)
