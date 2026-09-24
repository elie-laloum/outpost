---
title: "WorkspaceGitState"
description: "WorkspaceGitState — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export type WorkspaceGitState =
  | {
      readonly state: "registered";
      readonly head: string;
      readonly branch: string | null;
      readonly dirty: boolean;
      readonly locked: boolean;
    }
  | {
      readonly state: "unregistered";
    }
  | {
      readonly state: "skipped" | "unavailable";
      readonly reason: string;
    };
```
