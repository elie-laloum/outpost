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

| Nom              | Type                                                                                                                                                                                                                                | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `binary`         | `string`                                                                                                                                                                                                                            | Requis    | Chemin hôte absolu de l’exécutable firecracker.                                                                                                                                                                                                                                                                                                                                                                                             |
| `kernel`         | `string`                                                                                                                                                                                                                            | Requis    | Chemin hôte absolu de l’image du noyau invité.                                                                                                                                                                                                                                                                                                                                                                                              |
| `rootfs`         | `string`                                                                                                                                                                                                                            | Requis    | Chemin hôte absolu de l’image du système de fichiers racine invité ; chaque VM démarre sur une copie privée.                                                                                                                                                                                                                                                                                                                                |
| `tap`            | `string`                                                                                                                                                                                                                            | Requis    | Périphérique TAP hôte existant pour le réseau de l’invité, d’au plus 15 lettres, chiffres, points, tirets ou soulignés. Le provider le possède : il exécute donc une VM à la fois.                                                                                                                                                                                                                                                          |
| `guestMac`       | `string`                                                                                                                                                                                                                            | Requis    | Adresse MAC de l’interface réseau de l’invité, en six paires hexadécimales.                                                                                                                                                                                                                                                                                                                                                                 |
| `bootArgs`       | `string`                                                                                                                                                                                                                            | Requis    | Arguments de démarrage du noyau transmis à Firecracker.                                                                                                                                                                                                                                                                                                                                                                                     |
| `ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }`                                                                       | Requis    | Accès d’Outpost à l’invité : hôte, utilisateur, fichier d’identité, fichier known_hosts de confiance, port optionnel (22 par défaut) et binaire ssh.                                                                                                                                                                                                                                                                                        |
| `root`           | `string \| undefined`                                                                                                                                                                                                               | Optionnel | Répertoire du dépôt dans l’invité, /workspace par défaut.                                                                                                                                                                                                                                                                                                                                                                                   |
| `home`           | `string`                                                                                                                                                                                                                            | Requis    | Home de l’agent dans l’invité ; il doit correspondre au HOME de l’utilisateur invité, sinon la vérification de démarrage n’aboutit jamais.                                                                                                                                                                                                                                                                                                  |
| `cpus`           | `number \| undefined`                                                                                                                                                                                                               | Optionnel | vCPU de l’invité, 2 par défaut. Il ne limite pas le CPU hôte ; jailer.cpuQuotaUs le fait.                                                                                                                                                                                                                                                                                                                                                   |
| `memoryMb`       | `number \| undefined`                                                                                                                                                                                                               | Optionnel | Mémoire de l’invité en Mio, 2048 par défaut ; jailer.memoryMaxMb doit la dépasser.                                                                                                                                                                                                                                                                                                                                                          |
| `bootDeadlineMs` | `number \| undefined`                                                                                                                                                                                                               | Optionnel | Délai accordé à l’invité pour répondre par SSH avec ses prérequis, 60000 par défaut. Au-delà, l’acquisition échoue avec le code timeout et la VM s’arrête.                                                                                                                                                                                                                                                                                  |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                                                                                                     | Optionnel | Variables d’environnement définies pour chaque commande de la sandbox, en valeurs littérales. Une clé aussi déclarée par l’agent échoue avec le code configuration.                                                                                                                                                                                                                                                                         |
| `jailer`         | `{ readonly binary: string; readonly directory: string; readonly cgroup: string; readonly uid: number; readonly gid: number; readonly cpuQuotaUs: number; readonly memoryMaxMb: number; readonly processes: number; } \| undefined` | Optionnel | Lancement par le jailer Firecracker : binaire et chemins appartenant à root, parent cgroup v2 dédié avec les contrôleurs cpu, memory et pids activés, uid et gid non root, cpuQuotaUs par période de 100000 microsecondes (au moins 1000), memoryMaxMb supérieur à la mémoire invitée et processes (au moins 16). Outpost doit déjà tourner en root et n’appelle jamais sudo ; sans jailer, Firecracker tourne sous l’utilisateur appelant. |

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
