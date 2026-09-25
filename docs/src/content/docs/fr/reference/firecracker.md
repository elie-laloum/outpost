---
title: "firecracker"
description: "firecracker — Outpost API"
sidebar:
  order: 10
---

Contrat public de **firecracker**. Consultez le [guide prototype firecracker](../../guide/advanced/firecracker/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { firecracker } from "@elie-laloum/outpost/providers/firecracker";
```

## Rôle et comportement

Allouer une microVM opt-in via un hôte et un invité préparés explicitement.

Prototype de recherche avec prérequis hôte/KVM, image et réseau. Aucun repli silencieux vers l’exécution hôte. Un vrai démarrage exige une validation dédiée.

[Exemple complet et règles détaillées](../../guide/advanced/firecracker/).

## Paramètres et propriétés

| Nom                      | Type                                                                                                                                                          | Présence  | Rôle                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`                | `FirecrackerOptions`                                                                                                                                          | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.binary`         | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.kernel`         | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.rootfs`         | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.tap`            | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.guestMac`       | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.bootArgs`       | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.root`           | `string \| undefined`                                                                                                                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.home`           | `string`                                                                                                                                                      | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.cpus`           | `number \| undefined`                                                                                                                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.memoryMb`       | `number \| undefined`                                                                                                                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.bootDeadlineMs` | `number \| undefined`                                                                                                                                         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                               | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                       |

## Retour

`SandboxProvider`

## Signature

```ts
export declare function firecracker(
  options: FirecrackerOptions,
): SandboxProvider;
```

## Contrats associés

- [FirecrackerOptions](../firecrackeroptions/)
- [SandboxProvider](../sandboxprovider/)
