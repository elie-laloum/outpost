---
title: "SpeculationDurability"
description: "SpeculationDurability — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Fait partie de l’API expérimentale de spéculation : ce contrat peut encore changer. Consultez [Candidats concurrents](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationDurability } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                              | Présence  | Rôle                                                                                                                                                                                                                  |
| ------------- | --------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`                       | Requis    | Transport qui vous appartient et stocke la course sous speculations/&lt;sha256 du runId>.json avec des écritures conditionnelles, jusqu’à 16 Mio. createLocalTransport() sous .outpost/storage est le choix habituel. |
| `runId`       | `string`                          | Requis    | Nom stable et non vide de la course. Un seul coordinateur le possède à la fois ; un autre appel à speculate() sur ce nom rejette tant que le propriétaire n’a pas terminé ou été récupéré.                            |
| `version`     | `string`                          | Requis    | Version non vide de vos agents, de la validation et des réglages. Avec le dépôt, le provider, les clés, briefs et budget des candidats, elle doit correspondre à la course enregistrée, sinon speculate() rejette.    |
| `resume`      | `"retry-incomplete" \| undefined` | Optionnel | retry-incomplete rejoue les candidats interrompus en cours d’exécution, avec leurs effets de bord, en nouvelles tentatives. Sans cette valeur, une course aux candidats interrompus rejette.                          |

## Signature

```ts
export interface SpeculationDurability {
  readonly transporter: Transport;
  readonly runId: string;
  readonly version: string;
  readonly resume?: "retry-incomplete";
}
```

## Contrats associés

- [Transport](../transport/)
