---
title: "ObservationReporter"
description: "ObservationReporter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationReporter } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                  | Présence  | Rôle                                                                                                                                                                                     |
| --------- | ----------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event`   | `ObservationEvent & ReportPass`                       | Requis    | Événement d’observation avec numéro de passe optionnel pour l’interface historique appelable. Pour les enveloppes contextualisées, passez directement le reporter comme ObservationSink. |
| `observe` | `(observation: Observation) => void \| Promise<void>` | Requis    | Reçoit une enveloppe ; les promesses retournées sont sérialisées par récepteur et leurs rejets sont isolés de l’exécution.                                                               |
| `flush`   | `(() => void \| Promise<void>) \| undefined`          | Optionnel | Vide le tampon propre au récepteur ; le hub l’appelle depuis flush() avec son délai de livraison.                                                                                        |

## Signature

```ts
export interface ObservationReporter extends ObservationSink {
  (event: ObservationEvent & ReportPass): void;
}
```

## Contrats associés

- [ObservationEvent](../observationevent/)
- [ObservationSink](../observationsink/)
- [ReportPass](../support-reportpass/)
