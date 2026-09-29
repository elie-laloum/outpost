---
title: "createCronSchedule"
description: "createCronSchedule — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCronSchedule } from "@elie-laloum/outpost";
```

## Rôle et comportement

Analyse une expression cron à cinq champs, ou une macro comme @daily, évaluée dans un fuseau horaire IANA (UTC par défaut). Le résultat figé calcule les créneaux avec next() et previous() et ne publie rien. La construction refuse les champs invalides, les fuseaux inconnus et les expressions sans aucune occurrence.

[Exemple complet et règles détaillées](../../guide/triggers/).

## Paramètres et propriétés

| Nom                | Type                       | Présence  | Rôle                                                                                                                                                                           |
| ------------------ | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `expression`       | `string`                   | Requis    | Cinq champs (minute, heure, jour du mois, mois, jour de la semaine) avec listes, intervalles, pas et noms, ou une macro comme @hourly ou @daily ; les espaces sont normalisés. |
| `options`          | `CronOptions \| undefined` | Optionnel | Options d’évaluation ; omettez-les pour évaluer en UTC.                                                                                                                        |
| `options.timeZone` | `string \| undefined`      | Optionnel | Fuseau horaire IANA dont l’heure murale est décrite par l’expression, comme Europe/Paris ; UTC par défaut.                                                                     |

## Retour

`CronSchedule`

## Signature

```ts
export declare function createCronSchedule(
  expression: string,
  options?: CronOptions,
): CronSchedule;
```

## Contrats associés

- [CronOptions](../cronoptions/)
- [CronSchedule](../cronschedule/)
