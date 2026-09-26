---
title: "HarnessHookResult"
description: "HarnessHookResult — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessHookResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export type HarnessHookResult<Phase extends HarnessHookPhase> =
  HarnessHookDecisions[Phase] | undefined | void;
```

## Contrats associés

- [HarnessHookDecisions](../harnesshookdecisions/)
- [HarnessHookPhase](../harnesshookphase/)
