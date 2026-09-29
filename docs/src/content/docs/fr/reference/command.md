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

| Nom           | Type                                                                                                 | Présence  | Rôle                                                                                                                                                                                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `executable`  | `string`                                                                                             | Requis    | Programme à exécuter sans analyse shell implicite.                                                                                                                                                                                                                              |
| `arguments`   | `readonly string[] \| undefined`                                                                     | Optionnel | Arguments transmis tels quels, sans expansion shell.                                                                                                                                                                                                                            |
| `stdin`       | `string \| undefined`                                                                                | Optionnel | Texte écrit sur l’entrée standard, qui se ferme ensuite sauf si input est fourni.                                                                                                                                                                                               |
| `input`       | `Readable \| undefined`                                                                              | Optionnel | Flux lisible écrit sur l’entrée standard après stdin ; l’entrée reste ouverte jusqu’à la fin du flux. Vercel et Daytona relaient ses fragments par un fichier en ajout seul dans la sandbox.                                                                                    |
| `directory`   | `string \| undefined`                                                                                | Optionnel | Répertoire de travail dans la sandbox, sandbox.root par défaut.                                                                                                                                                                                                                 |
| `variables`   | `Readonly<Record<string, string>> \| undefined`                                                      | Optionnel | Variables d’environnement de cette seule commande, ajoutées par-dessus celles du provider. Docker, Podman et Firecracker rejettent avec le code configuration les noms qui ne sont pas des identifiants shell.                                                                  |
| `signal`      | `AbortSignal \| undefined`                                                                           | Optionnel | Son annulation arrête le groupe de processus et rejette la commande avec la raison du signal. La sandbox reste ouverte.                                                                                                                                                         |
| `deadlineMs`  | `number \| undefined`                                                                                | Optionnel | Durée maximale en millisecondes, 600000 par défaut (10 minutes). Au-delà, le groupe de processus est arrêté et la commande rejette avec le code timeout, ou avec une TimeoutError sur Vercel et Daytona.                                                                        |
| `interactive` | `boolean \| undefined`                                                                               | Optionnel | Exécute le processus dans un terminal : celui de l’hôte, ou les flux de terminal s’ils sont fournis. Docker et Podman n’allouent un TTY que si stdin de l’hôte en est un, Daytona ouvre un PTY, Vercel rejette avec le code provider et Firecracker avec le code configuration. |
| `terminal`    | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optionnel | Flux connectés à la place du terminal de l’hôte : input alimente l’entrée standard à la place de stdin et input, output et error reçoivent la sortie du processus, que le résultat conserve aussi. Outpost ne ferme pas ces flux.                                               |
| `elevated`    | `boolean \| undefined`                                                                               | Optionnel | Exécute la commande en root : utilisateur 0:0 sur Docker et Podman, sudo sur Vercel et Daytona. Firecracker la rejette avec le code configuration ; le provider local l’ignore.                                                                                                 |
| `retain`      | `number \| undefined`                                                                                | Optionnel | Nombre de caractères de fin de chaque flux conservés dans le résultat, 65536 par défaut ou l’option retain du provider. observe reçoit toujours toute la sortie.                                                                                                                |
| `observe`     | `((channel: Channel, text: string) => void) \| undefined`                                            | Optionnel | Reçoit chaque fragment stdout ou stderr en texte décodé pendant l’exécution. Une exception levée ici arrête la commande, qui rejette avec elle ; un terminal Daytona l’ignore.                                                                                                  |

## Signature

```ts
import type { Readable, Writable } from "node:stream";

export interface Command {
  readonly executable: string;
  readonly arguments?: readonly string[];
  readonly stdin?: string;
  /** Live stdin written after `stdin`; stdin closes when this stream ends. */
  readonly input?: Readable;
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
