---
title: "Turn"
description: "Turn — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Turn } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                   | Type                              | Présence  | Rôle                                                                                                                                                                             |
| --------------------- | --------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`                | `string`                          | Requis    | Texte de ce tour.                                                                                                                                                                |
| `status`              | `number`                          | Requis    | Statut de sortie du processus de l’agent. Toujours 0 dans un tour retourné : un statut non nul fait échouer le dispatch.                                                         |
| `interrupted`         | `"steering" \| undefined`         | Optionnel | steering lorsqu’Outpost a arrêté ce tour pour reprendre sa conversation avec une consigne de pilotage ; le tour suivant la poursuit. Absent pour les tours terminés d’eux-mêmes. |
| `conversation`        | `string \| undefined`             | Optionnel | Identifiant de conversation native après ce tour, quand l’agent en a fourni un.                                                                                                  |
| `transcript`          | `string \| undefined`             | Optionnel | Chemin sur l’hôte de la transcription capturée après ce tour.                                                                                                                    |
| `transcriptReference` | `TransportReference \| undefined` | Optionnel | Index distant versionné de la conversation capturée après ce tour ; son transcript local reste disponible séparément.                                                            |
| `usage`               | `Usage`                           | Requis    | Compteurs de tokens rapportés pour ce tour ; pas un coût.                                                                                                                        |
| `durationMs`          | `number`                          | Requis    | Durée de ce tour en millisecondes.                                                                                                                                               |

## Signature

```ts
export interface Turn {
  readonly text: string;
  readonly status: number;
  /** Set when steering stopped this turn to resume the conversation with new instructions. */
  readonly interrupted?: "steering";
  readonly conversation?: string;
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly usage: Usage;
  readonly durationMs: number;
}
```

## Contrats associés

- [TransportReference](../transportreference/)
- [Usage](../usage/)
