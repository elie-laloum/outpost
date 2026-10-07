---
title: "WatchdogOptions"
description: "WatchdogOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WatchdogOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                   | Présence | Rôle                                                                                                                                                                                                                                                                                                            |
| ------------ | -------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repetition` | `RepetitionPolicy`                     | Requis   | Fenêtre glissante d’activité et seuil d’occurrences pour un même nom/entrée d’outil ou un même contenu de changement de fichiers, comparés avant masquage.                                                                                                                                                      |
| `onStuck`    | `"stop" \| "warn" \| StuckInstruction` | Requis   | Politique obligatoire : stop interrompt avec le code stuck ; warn émet un avertissement et continue ; un objet de consigne dirige la boucle active ou reprend sa conversation CLI. Après la limite d’interventions, toute nouvelle répétition arrête l’agent. La fenêtre est réinitialisée après chaque alerte. |

## Signature

```ts
export interface WatchdogOptions {
  readonly repetition: RepetitionPolicy;
  readonly onStuck: "stop" | "warn" | StuckInstruction;
}
```

## Contrats associés

- [RepetitionPolicy](../repetitionpolicy/)
- [StuckInstruction](../stuckinstruction/)
