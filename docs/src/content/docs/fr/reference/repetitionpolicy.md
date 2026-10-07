---
title: "RepetitionPolicy"
description: "RepetitionPolicy — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RepetitionPolicy } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type     | Présence | Rôle                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------ | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `window`     | `number` | Requis   | Entier positif de 2 à 10000 : nombre de derniers événements outil/changement de fichiers décodés conservés entre les tours repris d’une exécution, réinitialisé entre passes et alertes. Le texte et les résultats ne font pas avancer la fenêtre ; les IDs d’appel dupliqués dans la fenêtre comptent une fois par type et portée.                                                             |
| `maxRepeats` | `number` | Requis   | Nombre d’occurrences déclenchant stuck, premier appel compris. Entier de 2 à window ; les appels ne doivent pas nécessairement être consécutifs. L’ordre des clés d’objet est ignoré, celui des tableaux et les chaînes exactes sont significatifs ; les entrées absentes correspondent entre elles séparément de null, et les autres entrées non JSON avancent la fenêtre sans correspondance. |

## Signature

```ts
export interface RepetitionPolicy {
  readonly window: number;
  readonly maxRepeats: number;
}
```
