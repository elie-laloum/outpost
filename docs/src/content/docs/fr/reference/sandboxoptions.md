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

| Nom                  | Type                                                     | Présence  | Rôle                                                                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `includeUncommitted` | `boolean \| undefined`                                   | Optionnel | Envoie aussi à une sandbox distante les modifications non commitées du worktree géré et ses fichiers non suivis et non ignorés. Les modifications du checkout de l'hôte n'y arrivent que par copies.                           |
| `agent`              | `DispatchAgent \| undefined`                             | Optionnel | Agent par défaut des dispatchs sur ce sandbox : un agent unique ou un createFallbackAgent(). Seul le premier candidat est bootstrappé à l’allocation ; attach() exige un agent CLI unique.                                     |
| `sandboxProvider`    | `SandboxProvider \| undefined`                           | Optionnel | Backend de l’environnement d’exécution.                                                                                                                                                                                        |
| `workspace`          | `Workspace \| undefined`                                 | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.                                                                                                                                             |
| `hooks`              | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie : workspaceReady s'exécute sur l'hôte une fois le worktree créé ; hostReady (dans l'ordre, sur l'hôte) et sandboxReady (en parallèle, dans la sandbox) s'exécutent simultanément après l'allocation. |
| `signal`             | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                                                     |
| `logging`            | `Logging \| undefined`                                   | Optionnel | Configure le transport du journal du dispatch, la conservation des événements détaillés et l’enregistrement rejouable des commits.                                                                                             |
| `bootstrap`          | `boolean \| undefined`                                   | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                                                                                                                                                     |
| `conversationHome`   | `string \| undefined`                                    | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                                                                                                                                                     |
| `recoveryTransport`  | `Transport \| undefined`                                 | Optionnel | Publie les archives de récupération vérifiées avant application des modifications distantes. La préparation locale de synchronisation demeure ; les archives survivent à la fermeture de la sandbox.                           |
| `activityTransport`  | `Transport \| undefined`                                 | Optionnel | Conserve les activités de la sandbox dans ce transport. La propriété distante reste non vérifiée ; les observations de PID ne récupèrent pas l’état d’une autre machine.                                                       |
| `observation`        | `ObservationHub \| undefined`                            | Optionnel | Hub facultatif appartenant à l’appelant pour les opérations de workspace, allocation, transfert et nettoyage ; créer un workspace ne ferme pas le hub.                                                                         |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                                                                                                                                           |
| `repository`         | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                                                                                                                                                                       |
| `branch`             | `BranchPolicy \| undefined`                              | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration.                                                                                                                 |
| `copies`             | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                                                                                                                                          |
| `limits`             | `StageLimits \| undefined`                               | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                                                                                                                                       |
| `label`              | `string \| undefined`                                    | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                                                                                                                                         |

## Signature

```ts
export interface SandboxOptions extends WorkspaceOptions {
  readonly includeUncommitted?: boolean;
  readonly agent?: DispatchAgent;
  readonly sandboxProvider?: SandboxProvider;
  readonly workspace?: Workspace;
  readonly hooks?: LifecycleHooks;
  readonly signal?: AbortSignal;
  readonly logging?: Logging;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
  readonly recoveryTransport?: Transport;
  readonly activityTransport?: Transport;
}
```

## Contrats associés

- [DispatchAgent](../dispatchagent/)
- [LifecycleHooks](../lifecyclehooks/)
- [Logging](../logging/)
- [SandboxProvider](../sandboxprovider/)
- [Transport](../transport/)
- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
