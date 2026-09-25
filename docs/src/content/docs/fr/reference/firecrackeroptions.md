---
title: "FirecrackerOptions"
description: "FirecrackerOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FirecrackerOptions } from "@elie-laloum/outpost/providers/firecracker";
```

## Paramètres et propriétés

| Nom              | Type                                                                                                                                                          | Présence  | Rôle                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `binary`         | `string`                                                                                                                                                      | Requis    | Chemin hôte du programme Firecracker.                                                                       |
| `kernel`         | `string`                                                                                                                                                      | Requis    | Chemin hôte de l’image du noyau invité Firecracker préparée.                                                |
| `rootfs`         | `string`                                                                                                                                                      | Requis    | Chemin hôte de l’image préparée du système de fichiers racine invité inscriptible.                          |
| `tap`            | `string`                                                                                                                                                      | Requis    | Nom du périphérique réseau TAP hôte préconfiguré pour la microVM.                                           |
| `guestMac`       | `string`                                                                                                                                                      | Requis    | Adresse MAC attribuée à l’interface réseau de l’invité.                                                     |
| `bootArgs`       | `string`                                                                                                                                                      | Requis    | Arguments de démarrage du noyau transmis à Firecracker.                                                     |
| `ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }` | Requis    | Réglages de connexion SSH à l’invité, dont le fichier d’identité et le fichier d’hôtes connus de confiance. |
| `root`           | `string \| undefined`                                                                                                                                         | Optionnel | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                                  |
| `home`           | `string`                                                                                                                                                      | Requis    | Chemin du home de l’agent à l’intérieur de l’environnement d’exécution.                                     |
| `cpus`           | `number \| undefined`                                                                                                                                         | Optionnel | Limite d’allocation CPU de l’environnement d’exécution.                                                     |
| `memoryMb`       | `number \| undefined`                                                                                                                                         | Optionnel | Limite d’allocation mémoire en mégaoctets.                                                                  |
| `bootDeadlineMs` | `number \| undefined`                                                                                                                                         | Optionnel | Durée maximale en millisecondes d’attente de la disponibilité SSH de l’invité.                              |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                               | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                     |

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
