---
title: "IssueOutcome"
description: "IssueOutcome — Outpost API"
sidebar:
  order: 10
---

Contrat public de **IssueOutcome**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { IssueOutcome } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface IssueOutcome {
  readonly id: string;
  readonly branch: string;
  readonly state: "empty" | "failed" | "merged";
  readonly error?: unknown;
}
```
