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

Libère la propriété d’une course durable dont le coordinateur s’est arrêté, à condition que son objet enregistré soit toujours à la révision indiquée ; sinon rejette avec TransportConflict. N’arrête et ne supprime rien : le prochain appel à speculate() arrête les ressources enregistrées et exige resume: retry-incomplete pour rejouer les candidats interrompus.

[Exemple complet et règles détaillées](../../guide/resuming-speculation/).

## Paramètres et propriétés

| Nom                          | Type                         | Présence | Rôle                                                                                                                                        |
| ---------------------------- | ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SpeculationRecoveryOptions` | Requis   | Identité de la course abandonnée, révision inspectée et confirmation explicite de l’arrêt de son coordinateur.                              |
| `options.runId`              | `string`                     | Requis   | runId de la course à libérer.                                                                                                               |
| `options.revision`           | `string`                     | Requis   | Révision de l’objet enregistré telle que vous l’avez lue ; si elle a changé depuis, la récupération rejette avec TransportConflict.         |
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
