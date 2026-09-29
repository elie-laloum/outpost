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

## Retour

`Task<InteractiveAgentResult>`

## Signature

```ts
export declare function defineInteractiveAgentTask(
  options: InteractiveAgentTaskOptions,
): Task<InteractiveAgentResult>;
```

## Contrats associés

- [InteractiveAgentResult](../interactiveagentresult/)
- [InteractiveAgentTaskOptions](../interactiveagenttaskoptions/)
- [Task](../type-task/)
