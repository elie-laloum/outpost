---
title: "defineHarnessSkill"
description: "defineHarnessSkill — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessSkill } from "@elie-laloum/outpost/harness";
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

<span id="outpost-instructions"></span>

## Instructions ajoutées par Outpost

Les templates ci-dessous conservent le texte anglais envoyé au modèle. `${…}` désigne les valeurs insérées à l’exécution, pas la syntaxe des variables d’un brief.

Quand `createHarness({ skills })` reçoit une liste non vide, il ajoute ce catalogue aux instructions système après celles du profil et du harness, avant les ajouts des hooks session-start :

```text
Skills are available on demand. Call load_skill with a skill name to read its instructions and enable its tools before using them:
- ${skill.name}: ${skill.description}
```

La ligne nom/description est répétée pour chaque compétence dans l’ordre de déclaration. L’outil injecté `load_skill` porte cette description visible par le modèle :

```text
Load a skill listed in the instructions: returns its instructions and enables its tools for the following steps.
```

Charger une compétence résout ses instructions et les renvoie comme résultat d’outil. Si la compétence possède des outils, ce résultat est :

```text
${resolvedInstructions}

Tools now available: ${toolNames}.
```

`toolNames` joint les noms des outils de la compétence avec `, `. Sans outils, seul `resolvedInstructions` est renvoyé. Le chargement n’ajoute pas le corps de la compétence au prompt système.

Les noms, descriptions et sources d’instructions sont configurables. L’introduction du catalogue, la description du chargeur et le suffixe annonçant les outils sont fixes ; aucune option ne permet de les remplacer. Omettre les compétences retire ce mécanisme. Le déverrouillage des outils dépend de l’historique effectif ; une réduction de l’historique peut donc imposer de recharger une compétence.

Implémentation : [skill.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/skill.ts) · [harness.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/domain/harness.ts) · [harness-loop.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/harness-loop.ts).

## Signature

```ts
export declare function defineHarnessSkill(
  options: HarnessSkillOptions,
): HarnessSkill;
```

## Contrats associés

- [HarnessSkill](../harnessskill/)
- [HarnessSkillOptions](../harnessskilloptions/)
