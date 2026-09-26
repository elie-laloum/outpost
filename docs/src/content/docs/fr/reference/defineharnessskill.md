---
title: "defineHarnessSkill"
description: "defineHarnessSkill — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import { defineHarnessSkill } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une skill : des instructions, et éventuellement des outils, qu’un harness personnalisé liste dans ses instructions système et que le modèle charge avec load_skill au besoin. Les outils d’une skill sont refusés tant qu’elle n’est pas chargée.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                    | Type                                                               | Présence  | Rôle                                                                                                               |
| ---------------------- | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `options`              | `HarnessSkillOptions`                                              | Requis    | Nom, description, instructions et outils optionnels de la skill.                                                   |
| `options.name`         | `string`                                                           | Requis    | Nom unique de la skill, transmis par le modèle à load_skill.                                                       |
| `options.description`  | `string`                                                           | Requis    | Courte description listée dans les instructions système pour que le modèle sache quand charger la skill.           |
| `options.instructions` | `HarnessInstructionSource`                                         | Requis    | Instructions renvoyées au chargement de la skill : texte ou résolveur recevant le sandbox, le signal et le modèle. |
| `options.tools`        | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optionnel | Outils ou jeux d’outils activés une fois la skill chargée ; leurs noms doivent être uniques dans tout le harness.  |

## Retour

`HarnessSkill`

## Signature

```ts
export declare function defineHarnessSkill(
  options: HarnessSkillOptions,
): HarnessSkill;
```

## Contrats associés

- [HarnessSkill](../harnessskill/)
- [HarnessSkillOptions](../harnessskilloptions/)
