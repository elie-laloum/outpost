---
title: "FirecrackerOptions"
description: "FirecrackerOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FirecrackerOptions**. Consultez le [guide prototype firecracker](../../guide/advanced/firecracker/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { FirecrackerOptions } from "@elie-laloum/outpost/providers/firecracker";
```

## Rôle et comportement

Allouer une microVM opt-in via un hôte et un invité préparés explicitement.

Prototype de recherche avec prérequis hôte/KVM, image et réseau. Aucun repli silencieux vers l’exécution hôte. Un vrai démarrage exige une validation dédiée.

[Exemple complet et règles détaillées](../../guide/advanced/firecracker/).

## Paramètres et propriétés

| Nom              | Type                                                                                                                                                          | Présence  | Rôle                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `binary`         | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `kernel`         | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `rootfs`         | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `tap`            | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `guestMac`       | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `bootArgs`       | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `root`           | `string \| undefined`                                                                                                                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `home`           | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `cpus`           | `number \| undefined`                                                                                                                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `memoryMb`       | `number \| undefined`                                                                                                                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `bootDeadlineMs` | `number \| undefined`                                                                                                                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                               | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.          |

## Signature

```ts
export interface FirecrackerOptions {
  readonly binary: string;
  readonly kernel: string;
  readonly rootfs: string;
  readonly tap: string;
  readonly guestMac: string;
  readonly bootArgs: string;
  readonly ssh: {
    readonly host: string;
    readonly user: string;
    readonly identity: string;
    readonly knownHosts: string;
    readonly port?: number;
    readonly binary?: string;
  };
  readonly root?: string;
  readonly home: string;
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly bootDeadlineMs?: number;
  readonly variables?: Variables;
}
```

## Contrats associés

- [Variables](../variables/)
