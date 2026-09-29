---
title: "InteractiveAgentTaskOptions"
description: "InteractiveAgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { InteractiveAgentTaskOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                    | Présence  | Rôle                                                                                                                                       |
| ------------------ | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `key`              | `string`                                | Requis    | Clé stable de la tâche ; participe également à l’identité de la branche conservée.                                                         |
| `after`            | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances devant réussir avant le premier tour.                                                                                          |
| `repository`       | `string`                                | Requis    | Checkout Git hôte contenant le worktree conservé et le stockage des conversations par défaut ; doit rester accessible à la reprise.        |
| `agent`            | `Agent`                                 | Requis    | Agent avec capture et reprise portables de la conversation ; sinon defineInteractiveAgentTask() lève une erreur de code configuration.     |
| `brief`            | `string`                                | Requis    | Instructions initiales littérales ; les réponses humaines sont fournies séparément aux tours suivants.                                     |
| `actors`           | `readonly string[]`                     | Requis    | Identifiants uniques et non vides autorisés à répondre ; l’application doit authentifier les utilisateurs.                                 |
| `sandboxProvider`  | `SandboxProvider \| undefined`          | Optionnel | Provider qui alloue une nouvelle sandbox à chaque tour, createDockerSandboxProvider() par défaut.                                          |
| `bootstrap`        | `boolean \| undefined`                  | Optionnel | Indique si la sandbox de chaque tour peut installer un agent CLI manquant, true par défaut.                                                |
| `conversationHome` | `string \| undefined`                   | Optionnel | Home hôte utilisé pour retrouver les conversations natives capturées entre les tours.                                                      |
| `maxTurns`         | `number \| undefined`                   | Optionnel | Nombre maximal de tours terminés, résultat final inclus ; 12 par défaut. Une question au dernier tour échoue au lieu de rester en attente. |
| `timeoutMs`        | `number \| undefined`                   | Optionnel | Délai coopératif de chaque tentative exécutée, excluant le temps d’attente d’une réponse humaine.                                          |

## Signature

```ts
export interface InteractiveAgentTaskOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly repository: string;
  readonly agent: Agent;
  readonly brief: string;
  readonly actors: readonly string[];
  readonly sandboxProvider?: SandboxProvider;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
  readonly maxTurns?: number;
  readonly timeoutMs?: number;
}
```

## Contrats associés

- [Agent](../type-agent/)
- [SandboxProvider](../sandboxprovider/)
- [Task](../type-task/)
