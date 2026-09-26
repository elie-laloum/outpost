---
title: "HarnessHookOptions"
description: "HarnessHookOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le streaming n’est pas encore disponible ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessHookOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom    | Type                                                                                                | Présence  | Rôle                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `on`   | `Phase`                                                                                             | Requis    | Point de la boucle où le hook s’exécute.                                                                                                  |
| `name` | `string \| undefined`                                                                               | Optionnel | Nom optionnel pour le diagnostic ; vaut la phase par défaut.                                                                              |
| `run`  | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Requis    | Fonction de contrôle de cette phase. Les hooks d’une phase s’exécutent dans l’ordre de déclaration ; une exception fait échouer la passe. |

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
