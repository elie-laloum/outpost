---
title: "HarnessSkillOptions"
description: "HarnessSkillOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessSkillOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                               | Présence  | Rôle                                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | `string`                                                           | Requis    | Nom unique de la skill, de 1 à 64 lettres, chiffres, tirets bas ou tirets, que le modèle passe à load_skill.                                                                                                |
| `description`  | `string`                                                           | Requis    | Courte description listée dans les instructions système pour que le modèle sache quand charger la skill.                                                                                                    |
| `instructions` | `HarnessInstructionSource`                                         | Requis    | Instructions renvoyées au chargement de la skill : texte ou résolveur recevant la sandbox, le signal et le modèle.                                                                                          |
| `tools`        | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optionnel | Outils ou jeux d’outils de la skill. Ils sont proposés au modèle avec les autres outils, mais un appel est refusé tant que la skill n’est pas chargée ; les noms doivent être uniques dans tout le harness. |

## Signature

```ts
export interface HarnessSkillOptions {
  readonly name: string;
  readonly description: string;
  readonly instructions: HarnessInstructionSource;
  readonly tools?: readonly (HarnessTool | HarnessToolset)[];
}
```

## Contrats associés

- [HarnessInstructionSource](../harnessinstructionsource/)
- [HarnessTool](../harnesstool/)
- [HarnessToolset](../harnesstoolset/)
