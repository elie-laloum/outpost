---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 10
---

Contrat public de **CodexSettings**. Consultez le [guide agents](../../agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CodexSettings extends CommonAgentSettings {
  readonly reasoning?: "low" | "medium" | "high" | "xhigh";
  readonly approvalReviewer?: "user" | "auto_review";
}
```

## Contrats associés

- [CommonAgentSettings](../support-commonagentsettings/)
