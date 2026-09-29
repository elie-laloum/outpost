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

| Nom                  | Type        | Présence | Rôle                                                                                                                                |
| -------------------- | ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `runId`              | `string`    | Requis   | runId de la course à libérer.                                                                                                       |
| `revision`           | `string`    | Requis   | Révision de l’objet enregistré telle que vous l’avez lue ; si elle a changé depuis, la récupération rejette avec TransportConflict. |
| `coordinatorStopped` | `true`      | Requis   | Confirmation explicite de l’arrêt de l’ancien coordinateur ; un PID distant ou un délai écoulé ne constitue pas une preuve.         |
| `transporter`        | `Transport` | Requis   | Transport qui contient la course enregistrée.                                                                                       |

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
