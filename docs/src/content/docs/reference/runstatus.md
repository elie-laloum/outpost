---
title: "RunStatus"
description: "RunStatus — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { RunStatus } from "@elie-laloum/outpost";
```

## Purpose and behavior

Execution projection lifecycle: running, suspected abandoned, or the settled workflow/dispatch outcome. Abandoned is derived at read time and authorizes no recovery.

[Complete example and detailed rules](../../guide/run-state/).

## Signature

```ts
export type RunStatus = "running" | "abandoned" | WorkflowResult["status"];
```

## Related contracts

- [WorkflowResult](../workflowresult/)
