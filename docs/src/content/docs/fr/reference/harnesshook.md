---
title: "HarnessHook"
description: "HarnessHook — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHook } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                                                | Présence  | Rôle                                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`      | `"hook"`                                                                                            | Requis    | Discriminant de la définition : hook.                                                                                                             |
| `on`        | `Phase`                                                                                             | Requis    | Point de la boucle où le hook s’exécute.                                                                                                          |
| `name`      | `string`                                                                                            | Requis    | Nom utilisé pour le diagnostic.                                                                                                                   |
| `timeoutMs` | `number \| undefined`                                                                               | Optionnel | Délai positif du callback ou de la commande en millisecondes ; 30000 par défaut. Les callbacks doivent respecter signal pour les opérations hôte. |
| `run`       | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Requis    | Fonction de contrôle de cette phase.                                                                                                              |

## Signature

```ts
export interface HarnessHook<
  Phase extends HarnessHookPhase = HarnessHookPhase,
> {
  readonly kind: "hook";
  readonly on: Phase;
  readonly name: string;
  readonly timeoutMs?: number;
  run(
    input: HarnessHookInput<Phase>,
  ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
}
```

## Contrats associés

- [HarnessHookInput](../harnesshookinput/)
- [HarnessHookPhase](../harnesshookphase/)
- [HarnessHookResult](../harnesshookresult/)
