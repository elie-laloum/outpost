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

| Nom                  | Type                                                             | Présence  | Rôle                                                                                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observation`        | `ObservationHub \| undefined`                                    | Optionnel | Hub d’observation parent. Le dispatch ouvre un hub enfant avec son propre dispatchId et le vide avant de retourner ou de lever une erreur.                                                                                                |
| `agent`              | `DispatchAgent \| undefined`                                     | Optionnel | Agent qui exécute le brief : issu de createAgent() ou createReplayAgent(), ou un createFallbackAgent() qui passe au candidat suivant sur une faute quota ou unavailable listée. Un agent de secours n’accepte pas continuation.           |
| `logging`            | `Logging \| undefined`                                           | Optionnel | Réglages du journal : transport, conservation détaillée des événements et enregistrement des commits pour le rejeu.                                                                                                                       |
| `label`              | `string \| undefined`                                            | Optionnel | Nom affiché pour ce dispatch dans les rapports de progression.                                                                                                                                                                            |
| `brief`              | `Brief`                                                          | Requis    | Tâche confiée à l’agent : texte littéral ou brief lu depuis un fichier.                                                                                                                                                                   |
| `passes`             | `number \| undefined`                                            | Optionnel | Nombre maximal de passes, 1 par défaut. Chaque passe relance le brief dans une nouvelle conversation, et le dispatch s’arrête à la première passe dont le texte contient un marqueur de fin. Doit valoir 1 avec response ou continuation. |
| `until`              | `string \| readonly string[] \| undefined`                       | Optionnel | Marqueur ou marqueurs de fin recherchés dans le texte du dernier tour, &lt;outpost>done&lt;/outpost> par défaut. Une liste vide désactive la recherche et toutes les passes s’exécutent ; les chaînes vides sont refusées.                |
| `idleMs`             | `number \| undefined`                                            | Optionnel | Silence maximal accepté de l’agent, 600000 par défaut (10 minutes). Au-delà, le tour s’arrête avec le code timeout.                                                                                                                       |
| `idleWarningMs`      | `number \| undefined`                                            | Optionnel | Durée de silence après laquelle un événement d’avertissement est émis, puis répété au même intervalle ; 60000 par défaut.                                                                                                                 |
| `settleMs`           | `number \| undefined`                                            | Optionnel | Attente après un marqueur de fin avant d’arrêter un agent encore actif, 60000 par défaut. Le tour reste un succès.                                                                                                                        |
| `deadlineMs`         | `number \| undefined`                                            | Optionnel | Durée maximale de chaque processus d’agent, 3600000 par défaut (une heure). Au-delà, le tour échoue avec le code timeout.                                                                                                                 |
| `expansionMs`        | `number \| undefined`                                            | Optionnel | Délai de chaque expansion shell d’un brief fichier, 30000 par défaut.                                                                                                                                                                     |
| `signal`             | `AbortSignal \| undefined`                                       | Optionnel | Son annulation arrête le processus de l’agent et rejette le dispatch avec la raison du signal.                                                                                                                                            |
| `steering`           | `Steering \| undefined`                                          | Optionnel | Contrôleur issu de createSteering(), attaché pendant tout le dispatch et libéré à sa fin. resume() et fork() ne le réutilisent pas.                                                                                                       |
| `continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Conversation native à continuer, par identifiant ; fork: true continue une copie et laisse l’originale intacte. Exige une seule passe et un agent qui sait reprendre.                                                                     |
| `response`           | `ResponseSpec<T> \| undefined`                                   | Optionnel | Contrat de réponse typée : la réponse balisée est analysée et validée, et une réponse invalide reçoit jusqu’à repairs tours de correction. Exige une seule passe.                                                                         |
| `telemetry`          | `DispatchTelemetry \| undefined`                                 | Optionnel | Instrumentation de tout le dispatch, préparation, synchronisation et nettoyage compris. Ses échecs ne changent pas le résultat.                                                                                                           |
| `observe`            | `((event: AgentObservation) => void) \| undefined`               | Optionnel | Reçoit chaque événement normalisé de l’agent avec son numéro de passe et son horodatage. Une exception levée ici est collectée dans observerErrors et ne change pas le résultat.                                                          |
| `warn`               | `((message: string) => void) \| undefined`                       | Optionnel | Reçoit les avertissements non bloquants, par exemple un agent silencieux ou un problème de stockage de conversation.                                                                                                                      |
| `diagnostic`         | `((message: string) => void) \| undefined`                       | Optionnel | Reçoit les messages de diagnostic, par exemple la taille estimée en tokens de chaque commande développée du brief.                                                                                                                        |
| `workspace`          | `Workspace \| undefined`                                         | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.                                                                                                                                                        |
| `hooks`              | `LifecycleHooks \| undefined`                                    | Optionnel | Commandes de cycle de vie : workspaceReady s'exécute sur l'hôte une fois le worktree créé ; hostReady (dans l'ordre, sur l'hôte) et sandboxReady (en parallèle, dans la sandbox) s'exécutent simultanément après l'allocation.            |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                                                                                                                                                      |
| `repository`         | `string \| undefined`                                            | Optionnel | Checkout Git hôte ciblé.                                                                                                                                                                                                                  |
| `branch`             | `BranchPolicy \| undefined`                                      | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration.                                                                                                                            |
| `copies`             | `readonly string[] \| undefined`                                 | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                                                                                                                                                     |
| `limits`             | `StageLimits \| undefined`                                       | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                                                                                                                                                  |
| `includeUncommitted` | `boolean \| undefined`                                           | Optionnel | Envoie aussi à une sandbox distante les modifications non commitées du worktree géré et ses fichiers non suivis et non ignorés. Les modifications du checkout de l'hôte n'y arrivent que par copies.                                      |
| `sandboxProvider`    | `SandboxProvider \| undefined`                                   | Optionnel | Backend de l’environnement d’exécution.                                                                                                                                                                                                   |
| `bootstrap`          | `boolean \| undefined`                                           | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                                                                                                                                                                |
| `conversationHome`   | `string \| undefined`                                            | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                                                                                                                                                                |
| `recoveryTransport`  | `Transport \| undefined`                                         | Optionnel | Publie les archives de récupération vérifiées avant application des modifications distantes. La préparation locale de synchronisation demeure ; les archives survivent à la fermeture de la sandbox.                                      |
| `activityTransport`  | `Transport \| undefined`                                         | Optionnel | Conserve les activités de la sandbox dans ce transport. La propriété distante reste non vérifiée ; les observations de PID ne récupèrent pas l’état d’une autre machine.                                                                  |

## Signature

```ts
export type ContinuationOptions<T = undefined> = DispatchOptions<T> &
  Omit<SandboxOptions, "agent">;
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
