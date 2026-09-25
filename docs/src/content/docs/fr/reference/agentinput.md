---
title: "AgentInput"
description: "AgentInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                             | Présence  | Rôle                                                                                                           |
| -------------- | ---------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `text`         | `string \| undefined`                                            | Optionnel | Prompt préparé transmis au CLI natif de l’agent.                                                               |
| `interactive`  | `boolean \| undefined`                                           | Optionnel | Demande une invocation d’agent ou un terminal de processus interactif.                                         |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Identifiant de conversation native à poursuivre ; fork demande une conversation distincte dérivée de celle-ci. |

## Signature

```ts
export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
}
```
