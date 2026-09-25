---
title: "SandboxOptions"
description: "SandboxOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                  | Type                                                     | Présence  | Rôle                                                                                                           |
| -------------------- | -------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `includeUncommitted` | `boolean \| undefined`                                   | Optionnel | Inclut les modifications hôtes non commitées dans le snapshot du dépôt distant.                                |
| `agent`              | `AgentAdapter \| undefined`                              | Optionnel | Adapter natif de l’agent de code.                                                                              |
| `provider`           | `SandboxProvider \| undefined`                           | Optionnel | Backend de l’environnement d’exécution.                                                                        |
| `workspace`          | `Workspace \| undefined`                                 | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.                             |
| `hooks`              | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                                                |
| `signal`             | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                                                     |
| `logging`            | `Logging \| undefined`                                   | Optionnel | Configure le fichier journal du dispatch et la conservation des événements détaillés.                          |
| `bootstrap`          | `boolean \| undefined`                                   | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                                     |
| `conversationHome`   | `string \| undefined`                                    | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                                     |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                           |
| `repository`         | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                                                       |
| `branch`             | `BranchPolicy \| undefined`                              | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration. |
| `copies`             | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                          |
| `limits`             | `StageLimits \| undefined`                               | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                       |
| `label`              | `string \| undefined`                                    | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                         |

## Signature

```ts
export interface SandboxOptions extends WorkspaceOptions {
  readonly includeUncommitted?: boolean;
  readonly agent?: AgentAdapter;
  readonly provider?: SandboxProvider;
  readonly workspace?: Workspace;
  readonly hooks?: LifecycleHooks;
  readonly signal?: AbortSignal;
  readonly logging?: Logging;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
- [LifecycleHooks](../lifecyclehooks/)
- [Logging](../logging/)
- [SandboxProvider](../sandboxprovider/)
- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
