---
title: "ContinuationOptions"
description: "ContinuationOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ContinuationOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                  | Type                                                             | Présence  | Rôle                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent`              | `AgentAdapter \| undefined`                                      | Optionnel | Adapter natif de l’agent de code.                                                                                                                                                                    |
| `logging`            | `Logging \| undefined`                                           | Optionnel | Configure le fichier journal du dispatch et la conservation des événements détaillés.                                                                                                                |
| `label`              | `string \| undefined`                                            | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                                                                                                               |
| `brief`              | `Brief`                                                          | Requis    | Entrée de tâche textuelle littérale ou provenant d’un fichier.                                                                                                                                       |
| `passes`             | `number \| undefined`                                            | Optionnel | Nombre maximal de passes d’agent ; une par défaut.                                                                                                                                                   |
| `until`              | `string \| readonly string[] \| undefined`                       | Optionnel | Marqueur(s) de fin ; une liste vide désactive la détection.                                                                                                                                          |
| `idleMs`             | `number \| undefined`                                            | Optionnel | Intervalle silencieux maximal en millisecondes.                                                                                                                                                      |
| `idleWarningMs`      | `number \| undefined`                                            | Optionnel | Intervalle de silence en millisecondes avant émission d’un avertissement d’inactivité.                                                                                                               |
| `settleMs`           | `number \| undefined`                                            | Optionnel | Délai de grâce en millisecondes après détection de fin avant l’arrêt d’un processus d’agent encore actif.                                                                                            |
| `deadlineMs`         | `number \| undefined`                                            | Optionnel | Durée maximale de chaque processus d’agent en millisecondes ; une heure par défaut.                                                                                                                  |
| `expansionMs`        | `number \| undefined`                                            | Optionnel | Délai en millisecondes de chaque expansion shell d’origine d’un brief fichier ; 30000 par défaut.                                                                                                    |
| `signal`             | `AbortSignal \| undefined`                                       | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                           |
| `continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Identifiant de conversation native à poursuivre ; fork demande une conversation distincte dérivée de celle-ci.                                                                                       |
| `response`           | `ResponseSpec<T> \| undefined`                                   | Optionnel | Analyseur et validateur de la réponse balisée.                                                                                                                                                       |
| `telemetry`          | `DispatchTelemetry \| undefined`                                 | Optionnel | Instrumentation optionnelle du dispatch complet, préparation, synchronisation et nettoyage compris ; ses erreurs ne changent pas le résultat.                                                        |
| `observe`            | `((event: AgentObservation) => void) \| undefined`               | Optionnel | Reçoit les observations normalisées d’agent avec numéro de passe et horodatage ; les erreurs d’observation sont isolées.                                                                             |
| `warn`               | `((message: string) => void) \| undefined`                       | Optionnel | Callback recevant les avertissements non bloquants d’exécution ou de stockage des conversations.                                                                                                     |
| `diagnostic`         | `((message: string) => void) \| undefined`                       | Optionnel | Callback recevant les messages de diagnostic d’exécution.                                                                                                                                            |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                                                                                                                 |
| `repository`         | `string \| undefined`                                            | Optionnel | Checkout Git hôte ciblé.                                                                                                                                                                             |
| `branch`             | `BranchPolicy \| undefined`                                      | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration.                                                                                       |
| `copies`             | `readonly string[] \| undefined`                                 | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                                                                                                                |
| `limits`             | `StageLimits \| undefined`                                       | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                                                                                                             |
| `hooks`              | `LifecycleHooks \| undefined`                                    | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                                                                                                                                      |
| `workspace`          | `Workspace \| undefined`                                         | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.                                                                                                                   |
| `includeUncommitted` | `boolean \| undefined`                                           | Optionnel | Inclut les modifications hôtes non commitées dans le snapshot du dépôt distant.                                                                                                                      |
| `provider`           | `SandboxProvider \| undefined`                                   | Optionnel | Backend de l’environnement d’exécution.                                                                                                                                                              |
| `bootstrap`          | `boolean \| undefined`                                           | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                                                                                                                           |
| `conversationHome`   | `string \| undefined`                                            | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                                                                                                                           |
| `recoveryTransport`  | `Transport \| undefined`                                         | Optionnel | Publie les archives de récupération vérifiées avant application des modifications distantes. La préparation locale de synchronisation demeure ; les archives survivent à la fermeture de la sandbox. |
| `activityTransport`  | `Transport \| undefined`                                         | Optionnel | Conserve les activités de la sandbox dans ce transport. La propriété distante reste non vérifiée ; les observations de PID ne récupèrent pas l’état d’une autre machine.                             |

## Signature

```ts
export type ContinuationOptions<T = undefined> = DispatchOptions<T> &
  Omit<SandboxOptions, "agent">;
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
