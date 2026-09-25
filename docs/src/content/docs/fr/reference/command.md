---
title: "Command"
description: "Command — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Command } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                                                 | Présence  | Rôle                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `executable`  | `string`                                                                                             | Requis    | Programme à exécuter sans analyse shell implicite.                                           |
| `arguments`   | `readonly string[] \| undefined`                                                                     | Optionnel | Arguments transmis directement au programme.                                                 |
| `stdin`       | `string \| undefined`                                                                                | Optionnel | Entrée fournie au processus.                                                                 |
| `directory`   | `string \| undefined`                                                                                | Optionnel | Dossier de travail dans l’environnement d’exécution ; racine du workspace par défaut.        |
| `variables`   | `Readonly<Record<string, string>> \| undefined`                                                      | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                      |
| `signal`      | `AbortSignal \| undefined`                                                                           | Optionnel | Annulation coopérative de cette opération.                                                   |
| `deadlineMs`  | `number \| undefined`                                                                                | Optionnel | Durée maximale de l’opération en millisecondes avant arrêt de la commande ou du transfert.   |
| `interactive` | `boolean \| undefined`                                                                               | Optionnel | Demande une invocation d’agent ou un terminal de processus interactif.                       |
| `terminal`    | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optionnel | Flux d’entrée, de sortie et d’erreur pour l’attachement à un terminal interactif réel.       |
| `elevated`    | `boolean \| undefined`                                                                               | Optionnel | Demande une exécution élevée à un provider qui la prend en charge.                           |
| `retain`      | `number \| undefined`                                                                                | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                     |
| `observe`     | `((channel: Channel, text: string) => void) \| undefined`                                            | Optionnel | Reçoit les fragments stdout/stderr avec leur canal ; les erreurs d’observation sont isolées. |

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
