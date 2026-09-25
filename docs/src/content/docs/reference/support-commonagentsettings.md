---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                           |
| ------------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `model`             | `string \| undefined`                           | Optional | Native CLI model identifier; availability depends on the account. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.            |
| `saveConversations` | `boolean \| undefined`                          | Optional | Enable native transcript capture when the adapter supports it.    |

## Signature

```ts
export interface CommonAgentSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
```

## Related contracts

- [Variables](../variables/)
