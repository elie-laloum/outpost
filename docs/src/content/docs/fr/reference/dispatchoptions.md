---
title: "DispatchOptions"
description: "DispatchOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                             | Présence  | Rôle                                                                                                                                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prices`        | `ModelPriceTable \| undefined`                                   | Optionnel | Tarifs facultatifs activant l’attribution par modèle dans usage. Utilisez calculateUsageCost sur le résultat pour afficher son estimation ; aucune limite monétaire propre au dispatch n’est appliquée.                                                                                                                   |
| `redact`        | `readonly RegExp[] \| undefined`                                 | Optionnel | Expressions régulières remplaçant les chaînes correspondantes observées et sauvegardées par [REDACTED]. Ajoutées aux règles héritées du hub ; les prompts envoyés à l’agent et les résultats retournés restent intacts.                                                                                                   |
| `observation`   | `ObservationHub \| undefined`                                    | Optionnel | Hub d’observation parent. Le dispatch ouvre un hub enfant avec son propre dispatchId et le vide avant de retourner ou de lever une erreur.                                                                                                                                                                                |
| `agent`         | `DispatchAgent \| undefined`                                     | Optionnel | Agent qui exécute le brief : issu de createAgent() ou createReplayAgent(), ou un createFallbackAgent() qui passe au candidat suivant sur une faute quota ou unavailable listée. Un agent de secours n’accepte pas continuation.                                                                                           |
| `logging`       | `Logging \| undefined`                                           | Optionnel | Réglages du journal : transport, conservation détaillée des événements et enregistrement des commits pour le rejeu.                                                                                                                                                                                                       |
| `label`         | `string \| undefined`                                            | Optionnel | Nom affiché pour ce dispatch dans les rapports de progression.                                                                                                                                                                                                                                                            |
| `brief`         | `Brief`                                                          | Requis    | Tâche confiée à l’agent : texte littéral ou brief lu depuis un fichier.                                                                                                                                                                                                                                                   |
| `passes`        | `number \| undefined`                                            | Optionnel | Nombre maximal de passes, 1 par défaut. Chaque passe relance le brief dans une nouvelle conversation, et le dispatch s’arrête à la première passe dont le texte contient un marqueur de fin. Doit valoir 1 avec response ou continuation.                                                                                 |
| `until`         | `string \| readonly string[] \| undefined`                       | Optionnel | Marqueur ou marqueurs de fin recherchés dans le texte du dernier tour, &lt;outpost>done&lt;/outpost> par défaut. Une liste vide désactive la recherche et toutes les passes s’exécutent ; les chaînes vides sont refusées.                                                                                                |
| `idleMs`        | `number \| undefined`                                            | Optionnel | Silence maximal accepté de l’agent, 600000 par défaut (10 minutes). Au-delà, le tour s’arrête avec le code timeout.                                                                                                                                                                                                       |
| `idleWarningMs` | `number \| undefined`                                            | Optionnel | Durée de silence après laquelle un événement d’avertissement est émis, puis répété au même intervalle ; 60000 par défaut.                                                                                                                                                                                                 |
| `settleMs`      | `number \| undefined`                                            | Optionnel | Attente après un marqueur de fin avant d’arrêter un agent encore actif, 60000 par défaut. Le tour reste un succès.                                                                                                                                                                                                        |
| `deadlineMs`    | `number \| undefined`                                            | Optionnel | Durée maximale de chaque processus d’agent, 3600000 par défaut (une heure). Au-delà, le tour échoue avec le code timeout.                                                                                                                                                                                                 |
| `expansionMs`   | `number \| undefined`                                            | Optionnel | Délai de chaque expansion shell d’un brief fichier, 30000 par défaut. Au-delà, le dispatch échoue avec le code timeout.                                                                                                                                                                                                   |
| `signal`        | `AbortSignal \| undefined`                                       | Optionnel | Son annulation arrête le processus de l’agent et rejette le dispatch avec la raison du signal.                                                                                                                                                                                                                            |
| `steering`      | `Steering \| undefined`                                          | Optionnel | Contrôleur issu de createSteering(), attaché pendant tout le dispatch et libéré à sa fin. resume() et fork() ne le réutilisent pas.                                                                                                                                                                                       |
| `continuation`  | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Conversation native à continuer, par identifiant ; fork: true continue une copie et laisse l’originale intacte. Exige une seule passe et un agent qui sait reprendre.                                                                                                                                                     |
| `response`      | `ResponseSpec<T> \| undefined`                                   | Optionnel | Contrat de réponse typée : ajoute les consignes de format final et le schéma d’entrée JSON après le brief rendu et les messages de steering incorporés au début du tour. Analyse et valide la réponse balisée, avec jusqu’à repairs tours de correction. Exige une seule passe ; l’injection ne peut pas être désactivée. |
| `telemetry`     | `DispatchTelemetry \| undefined`                                 | Optionnel | Instrumentation de tout le dispatch, préparation, synchronisation et nettoyage compris. Ses échecs ne changent pas le résultat.                                                                                                                                                                                           |
| `observe`       | `((event: AgentObservation) => void) \| undefined`               | Optionnel | Reçoit chaque événement normalisé de l’agent avec son numéro de passe et son horodatage. Une exception levée ici est collectée dans observerErrors et ne change pas le résultat.                                                                                                                                          |
| `warn`          | `((message: string) => void) \| undefined`                       | Optionnel | Reçoit les avertissements non bloquants, par exemple un agent silencieux ou un problème de stockage de conversation.                                                                                                                                                                                                      |
| `diagnostic`    | `((message: string) => void) \| undefined`                       | Optionnel | Reçoit les messages de diagnostic, par exemple la taille estimée en tokens de chaque commande développée du brief.                                                                                                                                                                                                        |

## Signature

```ts
export interface DispatchOptions<T = undefined> {
  readonly prices?: ModelPriceTable;
  readonly redact?: readonly RegExp[];
  readonly observation?: ObservationHub;
  readonly agent?: DispatchAgent;
  readonly logging?: Logging;
  readonly label?: string;
  readonly brief: Brief;
  readonly passes?: number;
  readonly until?: string | readonly string[];
  readonly idleMs?: number;
  readonly idleWarningMs?: number;
  readonly settleMs?: number;
  readonly deadlineMs?: number;
  readonly expansionMs?: number;
  readonly signal?: AbortSignal;
  /** Controller from createSteering() that sends instructions while the agent runs. */
  readonly steering?: Steering;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
  readonly response?: ResponseSpec<T>;
  readonly telemetry?: DispatchTelemetry;
  readonly observe?: (event: AgentObservation) => void;
  readonly warn?: (message: string) => void;
  readonly diagnostic?: (message: string) => void;
}
```

## Contrats associés

- [AgentObservation](../agentobservation/)
- [Brief](../brief/)
- [DispatchAgent](../dispatchagent/)
- [DispatchTelemetry](../dispatchtelemetry/)
- [Logging](../logging/)
- [ModelPriceTable](../modelpricetable/)
- [ObservationHub](../observationhub/)
- [ResponseSpec](../responsespec/)
- [Steering](../steering/)
