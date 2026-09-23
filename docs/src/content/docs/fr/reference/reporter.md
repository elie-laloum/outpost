---
title: "reporter"
description: "reporter — Outpost API"
sidebar:
  order: 10
---

Contrat public de **reporter**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [AgentEvent](../agentevent/)
- [ReporterOptions](../reporteroptions/)
- [ReportPass](../support-reportpass/)
