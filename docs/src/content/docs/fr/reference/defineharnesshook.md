---
title: "defineHarnessHook"
description: "defineHarnessHook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessHook } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit du code de contrôle exécuté à un point de la boucle du harness intégré : session-start, before-model, after-model, before-tool, after-tool ou stop. Contrairement aux observateurs, un hook peut ajouter des instructions, refuser ou réécrire un appel d’outil, remplacer son résultat ou refuser l’arrêt ; une exception d’un hook fait échouer le tour.

[Exemple complet et règles détaillées](../../guide/harness-hooks/).

## Paramètres et propriétés

| Nom            | Type                                                                                                | Présence  | Rôle                                                                                                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`      | `HarnessHookOptions<Phase>`                                                                         | Requis    | Phase de la boucle, nom optionnel et fonction de contrôle du hook.                                                                                                                                            |
| `options.on`   | `Phase`                                                                                             | Requis    | Point de la boucle où le hook s’exécute.                                                                                                                                                                      |
| `options.name` | `string \| undefined`                                                                               | Optionnel | Nom utilisé pour les diagnostics, le nom de la phase par défaut.                                                                                                                                              |
| `options.run`  | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Requis    | Fonction de contrôle de cette phase. Les hooks d’une phase s’exécutent dans l’ordre de déclaration ; une exception fait échouer le tour, et une décision invalide le fait échouer avec le code configuration. |

## Retour

`HarnessHook<Phase>`

## Signature

```ts
export declare function defineHarnessHook<Phase extends HarnessHookPhase>(
  options: HarnessHookOptions<Phase>,
): HarnessHook<Phase>;
```

## Contrats associés

- [HarnessHook](../harnesshook/)
- [HarnessHookOptions](../harnesshookoptions/)
- [HarnessHookPhase](../harnesshookphase/)
