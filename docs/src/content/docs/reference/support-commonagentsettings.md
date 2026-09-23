---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

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
