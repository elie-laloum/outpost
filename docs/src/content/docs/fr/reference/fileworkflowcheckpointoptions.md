---
title: "FileWorkflowCheckpointOptions"
description: "FileWorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                     | Présence  | Rôle                                                                                                                                                    |
| ------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory`   | `string \| undefined`    | Optionnel | Dossier des anciens checkpoints et verrous de processus locaux, exclusif avec transporter ; le format JSON existant est conservé.                       |
| `transporter` | `Transport \| undefined` | Optionnel | Alternative à directory ; utilise l’enveloppe de checkpoint du transport et une récupération explicite de propriété. Fournir un seul choix de stockage. |

## Signature

```ts
export interface FileWorkflowCheckpointOptions {
  /** Private directory for checkpoint data and local process ownership locks. */
  readonly directory?: string;
  readonly transporter?: Transport;
}
```

## Contrats associés

- [Transport](../transport/)
