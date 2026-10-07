---
title: "ScriptedTurn"
description: "ScriptedTurn — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScriptedTurn } from "@elie-laloum/outpost/testing";
```

## Paramètres et propriétés

| Nom      | Type                                 | Présence  | Rôle                                                                                                                                                                                         |
| -------- | ------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`   | `string \| undefined`                | Optionnel | Événement text ajouté après les événements fournis ; son absence n’ajoute aucun texte de réponse.                                                                                            |
| `events` | `readonly AgentEvent[] \| undefined` | Optionnel | Événements émis dans l’ordre avant text et usage. Les identifiants de conversation appartiennent à l’agent et ne peuvent pas être fournis ici. Un événement finished est ajouté s’il manque. |
| `usage`  | `Usage \| undefined`                 | Optionnel | Compteurs de tokens simulés pour la comptabilité normale du workflow. Compteurs nuls complets par défaut sauf si events contient usage ; combiner les deux sources est refusé.               |
| `commit` | `ScriptedCommit \| undefined`        | Optionnel | Commit Git réel sur l’hôte appliqué avant les événements, même avec un statut scripté non nul. Aucun commit n’est créé si ce champ est absent.                                               |
| `status` | `number \| undefined`                | Optionnel | Statut de sortie simulé, entier de 0 à 255, 0 par défaut. Un statut non nul exerce l’échec normal du dispatch et les retries du workflow.                                                    |
| `stderr` | `string \| undefined`                | Optionnel | Erreur standard simulée émise après les événements ; vide par défaut.                                                                                                                        |

## Signature

```ts
export interface ScriptedTurn {
  readonly text?: string;
  readonly events?: readonly AgentEvent[];
  readonly usage?: Usage;
  readonly commit?: ScriptedCommit;
  readonly status?: number;
  readonly stderr?: string;
}
```

## Contrats associés

- [AgentEvent](../agentevent/)
- [ScriptedCommit](../scriptedcommit/)
- [Usage](../usage/)
