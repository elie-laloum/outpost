---
title: "HarnessHookOptions"
description: "HarnessHookOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHookOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom    | Type                                                                                                | Présence  | Rôle                                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on`   | `Phase`                                                                                             | Requis    | Point de la boucle où le hook s’exécute.                                                                                                                                                                      |
| `name` | `string \| undefined`                                                                               | Optionnel | Nom utilisé pour les diagnostics, le nom de la phase par défaut.                                                                                                                                              |
| `run`  | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Requis    | Fonction de contrôle de cette phase. Les hooks d’une phase s’exécutent dans l’ordre de déclaration ; une exception fait échouer le tour, et une décision invalide le fait échouer avec le code configuration. |

## Signature

```ts
export interface HarnessHookOptions<Phase extends HarnessHookPhase> {
  readonly on: Phase;
  readonly name?: string;
  run(
    input: HarnessHookInput<Phase>,
  ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
}
```

## Contrats associés

- [HarnessHookInput](../harnesshookinput/)
- [HarnessHookPhase](../harnesshookphase/)
- [HarnessHookResult](../harnesshookresult/)
