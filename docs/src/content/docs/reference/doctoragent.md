---
title: "DoctorAgent"
description: "DoctorAgent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DoctorAgent } from "@elie-laloum/outpost";
```

## Purpose and behavior

Built-in agent a diagnostic targets: the agent argument of diagnoseAgentProtocol(), the agent option of diagnoseSandbox() and the agent named in a doctor report. Same values as BuiltInAgentName.

[Complete example and detailed rules](../../guide/diagnostics/).

## Signature

```ts
export type DoctorAgent = BuiltInAgentName;
```

## Related contracts

- [BuiltInAgentName](../support-builtinagentname/)
