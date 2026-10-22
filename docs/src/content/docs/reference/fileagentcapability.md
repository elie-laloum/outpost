---
title: "FileAgentCapability"
description: "FileAgentCapability — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FileAgentCapability } from "@elie-laloum/outpost/core";
```

## Purpose and behavior

A file workspace feature a CLI agent must have demonstrated: dispatch, continuation, repairs, liveInput or interactive. Outpost refuses an undeclared capability instead of trying it.

[Complete example and detailed rules](../../guide/sandbox-sessions/).

## Signature

```ts
export type FileAgentCapability = keyof NonNullable<
  AgentFeatures["fileWorkspaces"]
>;
```

## Related contracts

- [AgentFeatures](../support-agentfeatures/)
