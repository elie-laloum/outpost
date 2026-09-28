---
title: "Observation"
description: "Observation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Observation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                | Présence | Rôle                                                                                                                           |
| -------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `seq`    | `number`            | Requis   | Séquence strictement croissante partagée par un hub racine et ses enfants ; des trous peuvent indiquer des livraisons perdues. |
| `at`     | `string`            | Requis   | Horodatage ISO attribué à l’émission par Outpost, distinct d’un horodatage serveur amont.                                      |
| `source` | `ObservationSource` | Requis   | Sous-système Outpost qui produit l’événement.                                                                                  |
| `scope`  | `ObservationScope`  | Requis   | Champs workflow, tâche, tentative, dispatch, passe et candidat connus à l’émission.                                            |
| `event`  | `ObservationEvent`  | Requis   | Contenu typé ; filtrer son kind avant de lire les champs propres à une variante.                                               |

## Signature

```ts
export interface Observation {
  readonly seq: number;
  readonly at: string;
  readonly source: ObservationSource;
  readonly scope: ObservationScope;
  readonly event: ObservationEvent;
}
```

## Contrats associés

- [ObservationEvent](../observationevent/)
- [ObservationScope](../observationscope/)
- [ObservationSource](../observationsource/)
