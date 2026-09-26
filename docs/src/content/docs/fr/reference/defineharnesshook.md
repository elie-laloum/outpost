---
title: "defineHarnessHook"
description: "defineHarnessHook — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import { defineHarnessHook } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit du code de contrôle exécuté à un point de la boucle du moteur : session-start, before-model, after-model, before-tool, after-tool ou stop. Contrairement aux observateurs, un hook peut ajouter des instructions, refuser ou réécrire un appel d’outil, remplacer son résultat ou refuser l’arrêt ; une exception d’un hook fait échouer la passe.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom            | Type                                                                                                | Présence  | Rôle                                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `options`      | `HarnessHookOptions<Phase>`                                                                         | Requis    | Phase de la boucle, nom optionnel et fonction de contrôle du hook.                                                                        |
| `options.on`   | `Phase`                                                                                             | Requis    | Point de la boucle où le hook s’exécute.                                                                                                  |
| `options.name` | `string \| undefined`                                                                               | Optionnel | Nom optionnel pour le diagnostic ; vaut la phase par défaut.                                                                              |
| `options.run`  | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Requis    | Fonction de contrôle de cette phase. Les hooks d’une phase s’exécutent dans l’ordre de déclaration ; une exception fait échouer la passe. |

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
