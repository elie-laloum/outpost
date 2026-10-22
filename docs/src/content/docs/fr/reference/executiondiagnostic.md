---
title: "ExecutionDiagnostic"
description: "ExecutionDiagnostic — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ExecutionDiagnostic } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom       | Type     | Présence | Rôle                                                                                                                                                                              |
| --------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`    | `string` | Requis   | Identifiant stable de l’incompatibilité, indépendant de la formulation : unsupported-provider, missing-source, unsupported-binding, unsupported-capability ou git-workspace-only. |
| `message` | `string` | Requis   | Le message que createSandbox() ou dispatch() lève pour cette incompatibilité.                                                                                                     |

## Signature

```ts
export interface ExecutionDiagnostic {
  readonly code: string;
  readonly message: string;
}
```
