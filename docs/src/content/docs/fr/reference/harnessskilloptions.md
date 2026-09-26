---
title: "HarnessSkillOptions"
description: "HarnessSkillOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import type { HarnessSkillOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                               | Présence  | Rôle                                                                                                               |
| -------------- | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `name`         | `string`                                                           | Requis    | Nom unique de la skill, transmis par le modèle à load_skill.                                                       |
| `description`  | `string`                                                           | Requis    | Courte description listée dans les instructions système pour que le modèle sache quand charger la skill.           |
| `instructions` | `HarnessInstructionSource`                                         | Requis    | Instructions renvoyées au chargement de la skill : texte ou résolveur recevant le sandbox, le signal et le modèle. |
| `tools`        | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optionnel | Outils ou jeux d’outils activés une fois la skill chargée ; leurs noms doivent être uniques dans tout le harness.  |

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
