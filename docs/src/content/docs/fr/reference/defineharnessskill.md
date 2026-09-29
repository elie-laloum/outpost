---
title: "defineHarnessSkill"
description: "defineHarnessSkill — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessSkill } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit une skill : des instructions et des outils facultatifs qu’un harness intégré liste par nom et description dans son prompt système. Le modèle appelle load_skill pour lire les instructions ; les appels aux outils de la skill sont refusés jusque-là.

[Exemple complet et règles détaillées](../../guide/harness-context/).

## Paramètres et propriétés

| Nom                    | Type                                                               | Présence  | Rôle                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `HarnessSkillOptions`                                              | Requis    | Nom, description, instructions et outils optionnels de la skill.                                                                                                                                            |
| `options.name`         | `string`                                                           | Requis    | Nom unique de la skill, de 1 à 64 lettres, chiffres, tirets bas ou tirets, que le modèle passe à load_skill.                                                                                                |
| `options.description`  | `string`                                                           | Requis    | Courte description listée dans les instructions système pour que le modèle sache quand charger la skill.                                                                                                    |
| `options.instructions` | `HarnessInstructionSource`                                         | Requis    | Instructions renvoyées au chargement de la skill : texte ou résolveur recevant la sandbox, le signal et le modèle.                                                                                          |
| `options.tools`        | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optionnel | Outils ou jeux d’outils de la skill. Ils sont proposés au modèle avec les autres outils, mais un appel est refusé tant que la skill n’est pas chargée ; les noms doivent être uniques dans tout le harness. |

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
