---
title: "CodexModelProvider"
description: "CodexModelProvider — Outpost API"
sidebar:
  order: 10
---

Contrat public de **CodexModelProvider**. Consultez le [guide agents](../../agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { CodexModelProvider } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CodexModelProvider {
  readonly baseUrl: string;
  readonly apiKeyEnvironment?: string | false;
}
```
