---
title: "defineInteractiveAgentTask"
description: "defineInteractiveAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare un dialogue d’agent qui pose des questions à des humains entre ses tours. Chaque tour s’exécute dans une nouvelle sandbox sur une branche nommée conservée et poursuit la conversation capturée ; une question laisse la tâche en waiting-input jusqu’à ce que start() reçoive une réponse. Exige une exécution avec checkpoint et lève une erreur de code configuration pour un agent sans capture ni reprise portables.

[Exemple complet et règles détaillées](../../guide/interactive-tasks/).

## Paramètres et propriétés

### Variante 1 — `InteractiveAgentTaskOptions`

| Nom                        | Type                                    | Présence  | Rôle                                                                                                                                       |
| -------------------------- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `InteractiveAgentTaskOptions`           | Requis    | Agent, dépôt, répondants autorisés et paramètres du dialogue borné.                                                                        |
| `options.key`              | `string`                                | Requis    | Clé stable de la tâche ; participe également à l’identité de la branche conservée.                                                         |
| `options.after`            | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances devant réussir avant le premier tour.                                                                                          |
| `options.repository`       | `string`                                | Requis    | Checkout Git hôte contenant le worktree conservé et le stockage des conversations par défaut ; doit rester accessible à la reprise.        |
| `options.agent`            | `Agent`                                 | Requis    | Agent avec capture et reprise portables de la conversation ; sinon defineInteractiveAgentTask() lève une erreur de code configuration.     |
| `options.brief`            | `string`                                | Requis    | Instructions initiales littérales ; les réponses humaines sont fournies séparément aux tours suivants.                                     |
| `options.actors`           | `readonly string[]`                     | Requis    | Identifiants uniques et non vides autorisés à répondre ; l’application doit authentifier les utilisateurs.                                 |
| `options.sandboxProvider`  | `SandboxProvider \| undefined`          | Optionnel | Provider qui alloue une nouvelle sandbox à chaque tour, createDockerSandboxProvider() par défaut.                                          |
| `options.bootstrap`        | `boolean \| undefined`                  | Optionnel | Indique si la sandbox de chaque tour peut installer un agent CLI manquant, true par défaut.                                                |
| `options.conversationHome` | `string \| undefined`                   | Optionnel | Home hôte utilisé pour retrouver les conversations natives capturées entre les tours.                                                      |
| `options.maxTurns`         | `number \| undefined`                   | Optionnel | Nombre maximal de tours terminés, résultat final inclus ; 12 par défaut. Une question au dernier tour échoue au lieu de rester en attente. |
| `options.timeoutMs`        | `number \| undefined`                   | Optionnel | Délai coopératif de chaque tentative exécutée, excluant le temps d’attente d’une réponse humaine.                                          |

### Variante 2 — `FileInteractiveAgentTaskOptions`

| Nom                       | Type                                                     | Présence  | Rôle                                                                                                                                       |
| ------------------------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                 | `FileInteractiveAgentTaskOptions`                        | Requis    | Agent, dépôt, répondants autorisés et paramètres du dialogue borné.                                                                        |
| `options.workspaceSource` | `FileWorkspaceSource`                                    | Requis    | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                                                |
| `options.sandboxProvider` | `SandboxProvider`                                        | Requis    | Provider d’exécution disposant de la capacité de liaison de fichiers requise ; les providers legacy restent utilisables pour Git.          |
| `options.agent`           | `Agent`                                                  | Requis    | Agent avec capture et reprise portables de la conversation ; sinon defineInteractiveAgentTask() lève une erreur de code configuration.     |
| `options.key`             | `string`                                                 | Requis    | Clé stable de la tâche ; participe également à l’identité de la branche conservée.                                                         |
| `options.after`           | `readonly Task<unknown>[] \| undefined`                  | Optionnel | Dépendances devant réussir avant le premier tour.                                                                                          |
| `options.timeoutMs`       | `number \| undefined`                                    | Optionnel | Délai coopératif de chaque tentative exécutée, excluant le temps d’attente d’une réponse humaine.                                          |
| `options.brief`           | `string`                                                 | Requis    | Instructions initiales littérales ; les réponses humaines sont fournies séparément aux tours suivants.                                     |
| `options.actors`          | `readonly string[]`                                      | Requis    | Identifiants uniques et non vides autorisés à répondre ; l’application doit authentifier les utilisateurs.                                 |
| `options.maxTurns`        | `number \| undefined`                                    | Optionnel | Nombre maximal de tours terminés, résultat final inclus ; 12 par défaut. Une question au dernier tour échoue au lieu de rester en attente. |
| `options.hooks`           | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de préparation déclarées workspaceReady, hostReady et sandboxReady.                                                              |
| `options.recovery`        | `FileWorkspaceRecoveryAuthorization \| undefined`        | Optionnel | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow.          |
| `options.signal`          | `AbortSignal \| undefined`                               | Optionnel | Signal d’annulation transmis à l’opération et à son groupe de processus ; les sandboxes réutilisables restent utilisables.                 |
| `options.storageQuota`    | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Réservation d’admission via Transport ; coordonne les writers coopérants sans imposer de quota physique de disque.                         |
| `options.inputs`          | `readonly WorkspaceInput[] \| undefined`                 | Optionnel | Entrées de fichiers explicites ; les paramètres JSON du workflow ne sont jamais écrits implicitement sur disque.                           |
| `options.runtime`         | `WorkspaceRuntimeOptions \| undefined`                   | Optionnel | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                            |
| `options.paths`           | `readonly string[] \| undefined`                         | Optionnel | Sélection explicite de chemins relatifs ; la sélection de copie n’applique pas implicitement .gitignore.                                   |
| `options.retention`       | `WorkspaceRetention \| undefined`                        | Optionnel | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.                  |

## Retour

`Task<InteractiveAgentResult>` · `Task<FileInteractiveAgentResult>`

## Signature

```ts
export declare function defineInteractiveAgentTask(
  options: InteractiveAgentTaskOptions,
): Task<InteractiveAgentResult>;

export declare function defineInteractiveAgentTask(
  options: FileInteractiveAgentTaskOptions,
): Task<FileInteractiveAgentResult>;
```

## Contrats associés

- [FileInteractiveAgentResult](../fileinteractiveagentresult/)
- [FileInteractiveAgentTaskOptions](../fileinteractiveagenttaskoptions/)
- [InteractiveAgentResult](../interactiveagentresult/)
- [InteractiveAgentTaskOptions](../interactiveagenttaskoptions/)
- [Task](../type-task/)
