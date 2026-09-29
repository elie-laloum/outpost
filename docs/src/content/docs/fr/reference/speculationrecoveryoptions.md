---
title: "SpeculationRecoveryOptions"
description: "SpeculationRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Fait partie de l’API expérimentale de spéculation : ce contrat peut encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationRecoveryOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                  | Type        | Présence | Rôle                                                                                                                                        |
| -------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `runId`              | `string`    | Requis   | Identifiant de la course abandonnée dont la propriété est libérée.                                                                          |
| `revision`           | `string`    | Requis   | Révision exacte du transport inspectée par l’opérateur ; toute différence refuse la récupération et protège les modifications concurrentes. |
| `coordinatorStopped` | `true`      | Requis   | Confirmation explicite de l’arrêt de l’ancien coordinateur ; un PID distant ou un délai écoulé ne constitue pas une preuve.                 |
| `transporter`        | `Transport` | Requis   | Transport contenant l’enveloppe de propriété abandonnée de la course.                                                                       |

## Signature

```ts
export interface SpeculationRecoveryOptions extends TransportStoreOptions {
  readonly runId: string;
  readonly revision: string;
  readonly coordinatorStopped: true;
}
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
