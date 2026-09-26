---
title: "HarnessSkill"
description: "HarnessSkill — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import type { HarnessSkill } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                              | Présence | Rôle                                              |
| -------------- | --------------------------------- | -------- | ------------------------------------------------- |
| `kind`         | `"skill"`                         | Requis   | Discriminant de la définition : skill.            |
| `name`         | `string`                          | Requis   | Nom unique de la skill.                           |
| `description`  | `string`                          | Requis   | Description listée dans les instructions système. |
| `instructions` | `HarnessInstructions`             | Requis   | Instructions résolues au chargement de la skill.  |
| `tools`        | `readonly HarnessTool<unknown>[]` | Requis   | Outils aplatis activés par la skill.              |

## Signature

```ts
export interface HarnessSkill {
  readonly kind: "skill";
  readonly name: string;
  readonly description: string;
  readonly instructions: HarnessInstructions;
  readonly tools: readonly HarnessTool[];
}
```

## Contrats associés

- [HarnessInstructions](../harnessinstructions/)
- [HarnessTool](../harnesstool/)
