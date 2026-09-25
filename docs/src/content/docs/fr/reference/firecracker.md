---
title: "firecracker"
description: "firecracker — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { firecracker } from "@elie-laloum/outpost/providers/firecracker";
```

## Rôle et comportement

Crée un provider microVM Firecracker opt-in à partir de réglages explicites de noyau, rootfs, TAP et SSH. L’hôte doit fournir KVM et un invité préparé ; l’allocation ne se replie pas sur l’exécution hôte. Le bail acquis possède l’arrêt de la VM.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom                      | Type                                                                                                                                                          | Présence  | Rôle                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `options`                | `FirecrackerOptions`                                                                                                                                          | Requis    | Ressources de démarrage hôte/invité préparées, réseau, connexion SSH et ressources de VM.                   |
| `options.binary`         | `string`                                                                                                                                                      | Requis    | Chemin hôte du programme Firecracker.                                                                       |
| `options.kernel`         | `string`                                                                                                                                                      | Requis    | Chemin hôte de l’image du noyau invité Firecracker préparée.                                                |
| `options.rootfs`         | `string`                                                                                                                                                      | Requis    | Chemin hôte de l’image préparée du système de fichiers racine invité inscriptible.                          |
| `options.tap`            | `string`                                                                                                                                                      | Requis    | Nom du périphérique réseau TAP hôte préconfiguré pour la microVM.                                           |
| `options.guestMac`       | `string`                                                                                                                                                      | Requis    | Adresse MAC attribuée à l’interface réseau de l’invité.                                                     |
| `options.bootArgs`       | `string`                                                                                                                                                      | Requis    | Arguments de démarrage du noyau transmis à Firecracker.                                                     |
| `options.ssh`            | `{ readonly host: string; readonly user: string; readonly identity: string; readonly knownHosts: string; readonly port?: number; readonly binary?: string; }` | Requis    | Réglages de connexion SSH à l’invité, dont le fichier d’identité et le fichier d’hôtes connus de confiance. |
| `options.root`           | `string \| undefined`                                                                                                                                         | Optionnel | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                                  |
| `options.home`           | `string`                                                                                                                                                      | Requis    | Chemin du home de l’agent à l’intérieur de l’environnement d’exécution.                                     |
| `options.cpus`           | `number \| undefined`                                                                                                                                         | Optionnel | Limite d’allocation CPU de l’environnement d’exécution.                                                     |
| `options.memoryMb`       | `number \| undefined`                                                                                                                                         | Optionnel | Limite d’allocation mémoire en mégaoctets.                                                                  |
| `options.bootDeadlineMs` | `number \| undefined`                                                                                                                                         | Optionnel | Durée maximale en millisecondes d’attente de la disponibilité SSH de l’invité.                              |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                                                                                                               | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                     |

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
