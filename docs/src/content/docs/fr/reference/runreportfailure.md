---
title: "RunReportFailure"
description: "RunReportFailure — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReportFailure } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type             | Présence | Rôle                                                                                                                                                                 |
| ------------ | ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tool`       | `string`         | Requis   | Nom d’outil issu de l’appel associé, puis du résultat, ou unknown si aucun ne l’identifie.                                                                           |
| `command`    | `string \| null` | Requis   | Entrée chaîne ou champ command/cmd de l’appel d’outil associé, limité à 4096 caractères ; null si indisponible. C’est une description, jamais exécutée par report(). |
| `preview`    | `string`         | Requis   | Aperçu d’échec fourni par l’adaptateur, limité à 4096 caractères. Peut déjà être un extrait ; aucune sortie stdout ou stderr complète n’est collectée.               |
| `pass`       | `number \| null` | Requis   | Numéro de passe observé à partir de 1, ou null si l’événement n’avait pas de portée de passe.                                                                        |
| `subagentId` | `string \| null` | Requis   | Identifiant du sous-agent observé, ou null pour l’agent principal ou un événement sans portée de sous-agent.                                                         |

## Signature

```ts
export interface RunReportFailure {
  readonly tool: string;
  readonly command: string | null;
  readonly preview: string;
  readonly pass: number | null;
  readonly subagentId: string | null;
}
```
