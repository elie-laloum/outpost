---
title: "HarnessHookOptions"
description: "HarnessHookOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessHookOptions } from "@elie-laloum/outpost/harness";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom         | Type                                                                                                             | Présence          | Rôle                                                                                                                                                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on`        | `Phase`                                                                                                          | Requis            | Point de la boucle où le hook s’exécute.                                                                                                                                                                                                           |
| `name`      | `string \| undefined`                                                                                            | Optionnel         | Nom utilisé pour les diagnostics, le nom de la phase par défaut.                                                                                                                                                                                   |
| `timeoutMs` | `number \| undefined`                                                                                            | Optionnel         | Délai positif du callback ou de la commande en millisecondes ; 30000 par défaut. Les callbacks doivent respecter signal pour les opérations hôte.                                                                                                  |
| `command`   | `undefined \| HookCommand`                                                                                       | Selon la variante | Programme du sandbox recevant le contexte sérialisable du hook en JSON sur stdin. Renvoie une décision JSON propre à la phase ou une sortie vide. Un code non nul, une sortie invalide ou dépassant 1 Mio fait échouer le tour. Exclusif avec run. |
| `run`       | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>> \| undefined` | Selon la variante | Fonction de contrôle de cette phase. Les hooks d’une phase s’exécutent dans l’ordre de déclaration ; une exception fait échouer le tour, et une décision invalide le fait échouer avec le code configuration.                                      |

## Signature

```ts
export type HarnessHookOptions<Phase extends HarnessHookPhase> = {
  readonly on: Phase;
  readonly name?: string;
  readonly timeoutMs?: number;
} & (
  | {
      readonly command?: never;
      run(
        input: HarnessHookInput<Phase>,
      ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
    }
  | {
      readonly command: HookCommand;
      readonly run?: never;
    }
);
```

## Contrats associés

- [HarnessHookInput](../harnesshookinput/)
- [HarnessHookPhase](../harnesshookphase/)
- [HarnessHookResult](../harnesshookresult/)
- [HookCommand](../hookcommand/)
