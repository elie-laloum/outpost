---
title: "HarnessHook"
description: "HarnessHook — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Skills et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessHook } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom    | Type                                                                                                | Présence | Rôle                                     |
| ------ | --------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------- |
| `kind` | `"hook"`                                                                                            | Requis   | Discriminant de la définition : hook.    |
| `on`   | `Phase`                                                                                             | Requis   | Point de la boucle où le hook s’exécute. |
| `name` | `string`                                                                                            | Requis   | Nom utilisé pour le diagnostic.          |
| `run`  | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Requis   | Fonction de contrôle de cette phase.     |

## Signature

```ts
export interface HarnessHook<
  Phase extends HarnessHookPhase = HarnessHookPhase,
> {
  readonly kind: "hook";
  readonly on: Phase;
  readonly name: string;
  run(
    input: HarnessHookInput<Phase>,
  ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
}
```

## Contrats associés

- [HarnessHookInput](../harnesshookinput/)
- [HarnessHookPhase](../harnesshookphase/)
- [HarnessHookResult](../harnesshookresult/)
