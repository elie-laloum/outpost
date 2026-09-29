---
title: "recoverSpeculation"
description: "recoverSpeculation — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
La spéculation est expérimentale : ses options et son résultat peuvent encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import { recoverSpeculation } from "@elie-laloum/outpost";
```

## Rôle et comportement

Libère la propriété abandonnée d’une course avec une révision du transport inspectée, après arrêt du coordinateur précédent. Bloque les écritures périmées ; le prochain appel à speculate réconcilie les ressources enregistrées et exige une autorisation explicite avant de rejouer les candidats incomplets.

[Exemple complet et règles détaillées](../../guide/speculation/).

## Paramètres et propriétés

| Nom                          | Type                         | Présence | Rôle                                                                                                                                        |
| ---------------------------- | ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SpeculationRecoveryOptions` | Requis   | Identité de la course abandonnée, révision inspectée et confirmation explicite de l’arrêt de son coordinateur.                              |
| `options.runId`              | `string`                     | Requis   | Identifiant de la course abandonnée dont la propriété est libérée.                                                                          |
| `options.revision`           | `string`                     | Requis   | Révision exacte du transport inspectée par l’opérateur ; toute différence refuse la récupération et protège les modifications concurrentes. |
| `options.coordinatorStopped` | `true`                       | Requis   | Confirmation explicite de l’arrêt de l’ancien coordinateur ; un PID distant ou un délai écoulé ne constitue pas une preuve.                 |
| `options.transporter`        | `Transport`                  | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`Promise<void>`

## Signature

```ts
export declare function recoverSpeculation(
  options: SpeculationRecoveryOptions,
): Promise<void>;
```

## Contrats associés

- [SpeculationRecoveryOptions](../speculationrecoveryoptions/)
