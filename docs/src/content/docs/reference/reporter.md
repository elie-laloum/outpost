---
title: "reporter"
description: "reporter — Outpost API"
sidebar:
  order: 10
---

Public contract for **reporter**. See the [observability guide](../../agents/observability/) for behavior, defaults and examples.

## Import

```ts
import { reporter } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function reporter(
  options?: ReporterOptions,
): (event: AgentEvent & ReportPass) => void;
```

## Related contracts

- [AgentEvent](../agentevent/)
- [ReporterOptions](../reporteroptions/)
- [ReportPass](../support-reportpass/)
