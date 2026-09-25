---
title: "dispatch"
description: "dispatch — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { dispatch } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécute le brief d’un agent avec une sandbox allouée pour cet appel, collecte les tours, la sortie validée, l’usage et les commits, puis ferme les ressources possédées. Chaque passe froide reçoit un environnement neuf. Le résultat permet de reprendre ou de bifurquer une conversation capturée dans un environnement ultérieur.

[Exemple complet et règles détaillées](../../guide/agents/dispatch/).

## Paramètres et propriétés

| Nom                          | Type                                                                                            | Présence  | Rôle                                                                                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions & DispatchOptions<T> & RequiredAgent`                                           | Requis    | Préparation du dépôt et de la sandbox, avec brief d’agent, validation de réponse et limites d’exécution.                                                                                             |
| `options.includeUncommitted` | `boolean \| undefined`                                                                          | Optionnel | Inclut les modifications hôtes non commitées dans le snapshot du dépôt distant.                                                                                                                      |
| `options.agent`              | `import("../domain/agent.types.ts").CliAgent \| import("../domain/agent.types.ts").CustomAgent` | Optionnel | Adapter natif de l’agent de code.                                                                                                                                                                    |
| `options.sandboxProvider`    | `SandboxProvider \| undefined`                                                                  | Optionnel | Backend de l’environnement d’exécution.                                                                                                                                                              |
| `options.workspace`          | `Workspace \| undefined`                                                                        | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.                                                                                                                   |
| `options.hooks`              | `LifecycleHooks \| undefined`                                                                   | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                                                                                                                                      |
| `options.signal`             | `AbortSignal \| undefined`                                                                      | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                           |
| `options.logging`            | `Logging \| undefined`                                                                          | Optionnel | Configure le fichier journal du dispatch et la conservation des événements détaillés.                                                                                                                |
| `options.bootstrap`          | `boolean \| undefined`                                                                          | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                                                                                                                           |
| `options.conversationHome`   | `string \| undefined`                                                                           | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                                                                                                                           |
| `options.recoveryTransport`  | `Transport \| undefined`                                                                        | Optionnel | Publie les archives de récupération vérifiées avant application des modifications distantes. La préparation locale de synchronisation demeure ; les archives survivent à la fermeture de la sandbox. |
| `options.activityTransport`  | `Transport \| undefined`                                                                        | Optionnel | Conserve les activités de la sandbox dans ce transport. La propriété distante reste non vérifiée ; les observations de PID ne récupèrent pas l’état d’une autre machine.                             |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`                                        | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                                                                                                                 |
| `options.repository`         | `string \| undefined`                                                                           | Optionnel | Checkout Git hôte ciblé.                                                                                                                                                                             |
| `options.branch`             | `BranchPolicy \| undefined`                                                                     | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration.                                                                                       |
| `options.copies`             | `readonly string[] \| undefined`                                                                | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                                                                                                                |
| `options.limits`             | `StageLimits \| undefined`                                                                      | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                                                                                                             |
| `options.label`              | `string \| undefined`                                                                           | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                                                                                                               |
| `options.brief`              | `Brief`                                                                                         | Requis    | Entrée de tâche textuelle littérale ou provenant d’un fichier.                                                                                                                                       |
| `options.passes`             | `number \| undefined`                                                                           | Optionnel | Nombre maximal de passes d’agent ; une par défaut.                                                                                                                                                   |
| `options.until`              | `string \| readonly string[] \| undefined`                                                      | Optionnel | Marqueur(s) de fin ; une liste vide désactive la détection.                                                                                                                                          |
| `options.idleMs`             | `number \| undefined`                                                                           | Optionnel | Intervalle silencieux maximal en millisecondes.                                                                                                                                                      |
| `options.idleWarningMs`      | `number \| undefined`                                                                           | Optionnel | Intervalle de silence en millisecondes avant émission d’un avertissement d’inactivité.                                                                                                               |
| `options.settleMs`           | `number \| undefined`                                                                           | Optionnel | Délai de grâce en millisecondes après détection de fin avant l’arrêt d’un processus d’agent encore actif.                                                                                            |
| `options.deadlineMs`         | `number \| undefined`                                                                           | Optionnel | Durée maximale de chaque processus d’agent en millisecondes ; une heure par défaut.                                                                                                                  |
| `options.expansionMs`        | `number \| undefined`                                                                           | Optionnel | Délai en millisecondes de chaque expansion shell d’origine d’un brief fichier ; 30000 par défaut.                                                                                                    |
| `options.continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                | Optionnel | Identifiant de conversation native à poursuivre ; fork demande une conversation distincte dérivée de celle-ci.                                                                                       |
| `options.response`           | `ResponseSpec<T> \| undefined`                                                                  | Optionnel | Analyseur et validateur de la réponse balisée.                                                                                                                                                       |
| `options.telemetry`          | `DispatchTelemetry \| undefined`                                                                | Optionnel | Instrumentation optionnelle du dispatch complet, préparation, synchronisation et nettoyage compris ; ses erreurs ne changent pas le résultat.                                                        |
| `options.observe`            | `((event: AgentObservation) => void) \| undefined`                                              | Optionnel | Reçoit les observations normalisées d’agent avec numéro de passe et horodatage ; les erreurs d’observation sont isolées.                                                                             |
| `options.warn`               | `((message: string) => void) \| undefined`                                                      | Optionnel | Callback recevant les avertissements non bloquants d’exécution ou de stockage des conversations.                                                                                                     |
| `options.diagnostic`         | `((message: string) => void) \| undefined`                                                      | Optionnel | Callback recevant les messages de diagnostic d’exécution.                                                                                                                                            |

## Retour

`Promise<DispatchResult<T>>`

## Signature

```ts
export declare function dispatch<T = undefined>(
  options: SandboxOptions & DispatchOptions<T> & RequiredAgent,
): Promise<DispatchResult<T>>;
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
