---
title: "Command"
description: "Command — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Command**. Consultez le [guide commandes et terminal](../../guide/environment/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Command } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter un processus ou attacher une session interactive native avec possession explicite des flux.

Command renvoie les statuts non nuls ; l’appelant doit les vérifier. Attach exige un provider interactif compatible. Vercel rejette l’attachement.

[Exemple complet et règles détaillées](../../guide/environment/commands/).

## Paramètres et propriétés

| Nom           | Type                                                                                                 | Présence  | Rôle                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `executable`  | `string`                                                                                             | Requis    | Programme à exécuter sans analyse shell implicite.                               |
| `arguments`   | `readonly string[] \| undefined`                                                                     | Optionnel | Arguments transmis directement au programme.                                     |
| `stdin`       | `string \| undefined`                                                                                | Optionnel | Entrée fournie au processus.                                                     |
| `directory`   | `string \| undefined`                                                                                | Optionnel | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `variables`   | `Readonly<Record<string, string>> \| undefined`                                                      | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.          |
| `signal`      | `AbortSignal \| undefined`                                                                           | Optionnel | Annulation coopérative de cette opération.                                       |
| `deadlineMs`  | `number \| undefined`                                                                                | Optionnel | Échéance absolue de l’opération en millisecondes.                                |
| `interactive` | `boolean \| undefined`                                                                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `terminal`    | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `elevated`    | `boolean \| undefined`                                                                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `retain`      | `number \| undefined`                                                                                | Optionnel | Taille maximale de la fin conservée par flux, en octets.                         |
| `observe`     | `((channel: Channel, text: string) => void) \| undefined`                                            | Optionnel | Callback d’observation ; ses erreurs sont isolées.                               |

## Signature

```ts
import type { Readable, Writable } from "node:stream";

export interface Command {
  readonly executable: string;
  readonly arguments?: readonly string[];
  readonly stdin?: string;
  readonly directory?: string;
  readonly variables?: Variables;
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
  readonly interactive?: boolean;
  readonly terminal?: {
    readonly input?: Readable;
    readonly output?: Writable;
    readonly error?: Writable;
  };
  readonly elevated?: boolean;
  readonly retain?: number;
  readonly observe?: (channel: Channel, text: string) => void;
}
```

## Contrats associés

- [Channel](../channel/)
- [Variables](../variables/)
