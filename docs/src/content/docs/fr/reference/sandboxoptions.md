---
title: "SandboxOptions"
description: "SandboxOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxOptions**. Consultez le [guide sandboxes](../../guide/environment/lifecycle/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Acquérir un environnement d’exécution et le réutiliser pour des commandes ou tâches d’agent séquentielles.

Docker est le provider par défaut. Une seule opération peut posséder une sandbox à la fois. La fermeture est idempotente ; annuler une commande ne détruit pas à elle seule une sandbox chaude.

[Exemple complet et règles détaillées](../../guide/environment/lifecycle/).

## Paramètres et propriétés

| Nom                  | Type                                                     | Présence  | Rôle                                                                               |
| -------------------- | -------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `includeUncommitted` | `boolean \| undefined`                                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `agent`              | `AgentAdapter \| undefined`                              | Optionnel | Adapter natif de l’agent de code.                                                  |
| `provider`           | `SandboxProvider \| undefined`                           | Optionnel | Backend de l’environnement d’exécution.                                            |
| `workspace`          | `Workspace \| undefined`                                 | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche. |
| `hooks`              | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                    |
| `signal`             | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                         |
| `logging`            | `Logging \| undefined`                                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `bootstrap`          | `boolean \| undefined`                                   | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.         |
| `conversationHome`   | `string \| undefined`                                    | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                         |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `repository`         | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                           |
| `branch`             | `BranchPolicy \| undefined`                              | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.     |
| `copies`             | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                              |
| `limits`             | `StageLimits \| undefined`                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |
| `label`              | `string \| undefined`                                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.   |

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
