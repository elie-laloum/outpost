---
title: "FirecrackerOptions"
description: "FirecrackerOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Configuration Firecracker expérimentale avec assets de démarrage, réseau et SSH préparés manuellement. La configuration optionnelle du jailer exige une préparation privilégiée, des chemins hôte protégés et des contrôleurs cgroup v2 dédiés. La validation pour la production reste incomplète. Consultez les [prérequis et limites](../../guide/microvms/).
:::

## Import

```ts
import type { FirecrackerOptions } from "@elie-laloum/outpost/providers/firecracker";
```

## Paramètres et propriétés

| Nom              | Type                                                                                                                                                                                                                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `binary`         | `string`                                                                                                                                                                                                                            | Requis    | Chemin hôte du programme Firecracker.                                                                                                                                                                                                                                                                                                                                                                                                      |
| `kernel`         | `string`                                                                                                                                                                                                                            | Requis    | Chemin hôte de l’image du noyau invité Firecracker préparée.                                                                                                                                                                                                                                                                                                                                                                               |
| `rootfs`         | `string`                                                                                                                                                                                                                            | Requis    | Chemin hôte de l’image préparée du système de fichiers racine invité inscriptible.                                                                                                                                                                                                                                                                                                                                                         |
| `tap`            | `string`                                                                                                                                                                                                                            | Requis    | Nom du périphérique réseau TAP hôte préconfiguré pour la microVM.                                                                                                                                                                                                                                                                                                                                                                          |
| `guestMac`       | `string`                                                                                                                                                                                                                            | Requis    | Adresse MAC attribuée à l’interface réseau de l’invité.                                                                                                                                                                                                                                                                                                                                                                                    |
| `bootArgs`       | `string`                                                                                                                                                                                                                            | Requis    | Arguments de démarrage du noyau transmis à Firecracker.                                                                                                                                                                                                                                                                                                                                                                                    |
| `ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }`                                                                       | Requis    | Réglages de connexion SSH à l’invité, dont le fichier d’identité et le fichier d’hôtes connus de confiance.                                                                                                                                                                                                                                                                                                                                |
| `root`           | `string \| undefined`                                                                                                                                                                                                               | Optionnel | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                                                                                                                                                                                                                                                                                                                                                                 |
| `home`           | `string`                                                                                                                                                                                                                            | Requis    | Chemin du home de l’agent à l’intérieur de l’environnement d’exécution.                                                                                                                                                                                                                                                                                                                                                                    |
| `cpus`           | `number \| undefined`                                                                                                                                                                                                               | Optionnel | Nombre de vCPU invités ; n’impose pas de quota CPU hôte. Le réglage cpuQuotaUs du jailer limite séparément le temps CPU du VMM.                                                                                                                                                                                                                                                                                                            |
| `memoryMb`       | `number \| undefined`                                                                                                                                                                                                               | Optionnel | Taille de la mémoire invitée en Mio. La limite optionnelle memoryMaxMb du jailer couvre le VMM et doit dépasser la mémoire invitée.                                                                                                                                                                                                                                                                                                        |
| `bootDeadlineMs` | `number \| undefined`                                                                                                                                                                                                               | Optionnel | Durée maximale en millisecondes d’attente de la disponibilité SSH de l’invité.                                                                                                                                                                                                                                                                                                                                                             |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                                                                                                     | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                                                                                                                                                    |
| `jailer`         | `{ readonly binary: string; readonly directory: string; readonly cgroup: string; readonly uid: number; readonly gid: number; readonly cpuQuotaUs: number; readonly memoryMaxMb: number; readonly processes: number; } \| undefined` | Optionnel | Lancement optionnel avec jailer : binaire et assets appartenant à root, répertoire protégé, parent cgroup v2 dédié, uid/gid non root, cpuQuotaUs par période de 100000 microsecondes, memoryMaxMb incluant le surcoût du VMM et limite de threads processes. Exige un superviseur root de confiance, sans appel à sudo. Les contrôleurs CPU, mémoire et pids doivent déjà être activés. Omettre conserve le lancement direct expérimental. |

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
  readonly jailer?: {
    readonly binary: string;
    readonly directory: string;
    readonly cgroup: string;
    readonly uid: number;
    readonly gid: number;
    readonly cpuQuotaUs: number;
    readonly memoryMaxMb: number;
    readonly processes: number;
  };
}
```

## Contrats associés

- [Variables](../variables/)
