---
title: "createSandbox"
description: "createSandbox — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSandbox } from "@elie-laloum/outpost";
```

## Rôle et comportement

Alloue un environnement autour d’un workspace nouveau ou fourni par l’appelant. La sandbox renvoyée permet d’enchaîner commandes et tours d’agent sur le même bail ; l’appelant doit la fermer. Un workspace fourni conserve sa durée de vie indépendante.

[Exemple complet et règles détaillées](../../guide/environment/lifecycle/).

## Paramètres et propriétés

| Nom                          | Type                                                     | Présence  | Rôle                                                                                                                                                                                                 |
| ---------------------------- | -------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions \| undefined`                            | Optionnel | Configuration de possession du workspace, allocation du provider, agent par défaut et cycle de vie.                                                                                                  |
| `options.includeUncommitted` | `boolean \| undefined`                                   | Optionnel | Inclut les modifications hôtes non commitées dans le snapshot du dépôt distant.                                                                                                                      |
| `options.agent`              | `Agent \| undefined`                                     | Optionnel | Adapter natif de l’agent de code.                                                                                                                                                                    |
| `options.sandboxProvider`    | `SandboxProvider \| undefined`                           | Optionnel | Backend de l’environnement d’exécution.                                                                                                                                                              |
| `options.workspace`          | `Workspace \| undefined`                                 | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.                                                                                                                   |
| `options.hooks`              | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                                                                                                                                      |
| `options.signal`             | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                           |
| `options.logging`            | `Logging \| undefined`                                   | Optionnel | Configure le fichier journal du dispatch et la conservation des événements détaillés.                                                                                                                |
| `options.bootstrap`          | `boolean \| undefined`                                   | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                                                                                                                           |
| `options.conversationHome`   | `string \| undefined`                                    | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                                                                                                                           |
| `options.recoveryTransport`  | `Transport \| undefined`                                 | Optionnel | Publie les archives de récupération vérifiées avant application des modifications distantes. La préparation locale de synchronisation demeure ; les archives survivent à la fermeture de la sandbox. |
| `options.activityTransport`  | `Transport \| undefined`                                 | Optionnel | Conserve les activités de la sandbox dans ce transport. La propriété distante reste non vérifiée ; les observations de PID ne récupèrent pas l’état d’une autre machine.                             |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                                                                                                                 |
| `options.repository`         | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                                                                                                                                             |
| `options.branch`             | `BranchPolicy \| undefined`                              | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration.                                                                                       |
| `options.copies`             | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                                                                                                                |
| `options.limits`             | `StageLimits \| undefined`                               | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                                                                                                             |
| `options.label`              | `string \| undefined`                                    | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                                                                                                               |

## Retour

`Promise<Sandbox>`

## Signature

```ts
export declare function createSandbox(
  options?: SandboxOptions,
): Promise<Sandbox>;
```

## Contrats associés

- [Sandbox](../sandbox/)
- [SandboxOptions](../sandboxoptions/)
