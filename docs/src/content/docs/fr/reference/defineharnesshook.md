---
title: "defineHarnessHook"
description: "defineHarnessHook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessHook } from "@elie-laloum/outpost/harness";
```

## Rôle et comportement

Déclare un callback ou une commande du sandbox pour une des 13 phases de la boucle Outpost. Les hooks suivent l’ordre de déclaration ; une décision invalide ou une erreur fait échouer le tour. Les transformations conservent l’usage original, les refus et les limites de sortie. Les appels d’outils réécrits repassent les contrôles de schéma et de permissions.

[Exemple complet et règles détaillées](../../guide/harness-hooks/).

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom                 | Type                                                                                                             | Présence          | Rôle                                                                                                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `HarnessHookOptions<Phase>`                                                                                      | Requis            | Phase de la boucle, nom optionnel et fonction de contrôle du hook.                                                                                                                                                                                 |
| `options.on`        | `Phase`                                                                                                          | Requis            | Point de la boucle où le hook s’exécute.                                                                                                                                                                                                           |
| `options.name`      | `string \| undefined`                                                                                            | Optionnel         | Nom utilisé pour les diagnostics, le nom de la phase par défaut.                                                                                                                                                                                   |
| `options.timeoutMs` | `number \| undefined`                                                                                            | Optionnel         | Délai positif du callback ou de la commande en millisecondes ; 30000 par défaut. Les callbacks doivent respecter signal pour les opérations hôte.                                                                                                  |
| `options.command`   | `HookCommand \| undefined`                                                                                       | Selon la variante | Programme du sandbox recevant le contexte sérialisable du hook en JSON sur stdin. Renvoie une décision JSON propre à la phase ou une sortie vide. Un code non nul, une sortie invalide ou dépassant 1 Mio fait échouer le tour. Exclusif avec run. |
| `options.run`       | `undefined \| (input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Selon la variante | Fonction de contrôle de cette phase. Les hooks d’une phase s’exécutent dans l’ordre de déclaration ; une exception fait échouer le tour, et une décision invalide le fait échouer avec le code configuration.                                      |

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
