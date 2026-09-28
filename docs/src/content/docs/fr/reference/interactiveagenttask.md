---
title: "interactiveAgentTask"
description: "interactiveAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { interactiveAgentTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit un dialogue d’agent avec checkpoint et attentes humaines durables entre les tours. La tâche alloue et ferme un sandbox par tour, capture sa conversation et conserve un worktree nommé sans l’intégrer. Le harness Outpost comme les adaptateurs CLI exigent capture portable et reprise. Le résultat contient du JSON sans perte et les références de conversation et de workspace ; les tours interrompus exigent une autorisation explicite de rejeu.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom                        | Type                                    | Présence  | Rôle                                                                                                                                       |
| -------------------------- | --------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `InteractiveAgentTaskOptions`           | Requis    | Agent, dépôt, répondants autorisés et paramètres du dialogue borné.                                                                        |
| `options.key`              | `string`                                | Requis    | Clé stable de la tâche ; participe également à l’identité de la branche conservée.                                                         |
| `options.after`            | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances devant réussir avant le premier tour.                                                                                          |
| `options.repository`       | `string`                                | Requis    | Checkout Git hôte contenant le worktree conservé et le stockage des conversations par défaut ; doit rester accessible à la reprise.        |
| `options.agent`            | `Agent`                                 | Requis    | Agent CLI ou Outpost composé, avec capture portable et continuation des conversations activées.                                            |
| `options.brief`            | `string`                                | Requis    | Instructions initiales littérales ; les réponses humaines sont fournies séparément aux tours suivants.                                     |
| `options.actors`           | `readonly string[]`                     | Requis    | Identifiants uniques et non vides autorisés à répondre ; l’application doit authentifier les utilisateurs.                                 |
| `options.sandboxProvider`  | `SandboxProvider \| undefined`          | Optionnel | Provider allouant un nouveau sandbox par tour ; son absence utilise les valeurs par défaut habituelles.                                    |
| `options.bootstrap`        | `boolean \| undefined`                  | Optionnel | Indique si le sandbox peut installer une CLI absente lors de la préparation de chaque tour.                                                |
| `options.conversationHome` | `string \| undefined`                   | Optionnel | Home hôte utilisé pour retrouver les conversations natives capturées entre les tours.                                                      |
| `options.maxTurns`         | `number \| undefined`                   | Optionnel | Nombre maximal de tours terminés, résultat final inclus ; 12 par défaut. Une question au dernier tour échoue au lieu de rester en attente. |
| `options.timeoutMs`        | `number \| undefined`                   | Optionnel | Délai coopératif de chaque tentative exécutée, excluant le temps d’attente d’une réponse humaine.                                          |

## Retour

`Task<InteractiveAgentResult>`

## Signature

```ts
export declare function interactiveAgentTask(
  options: InteractiveAgentTaskOptions,
): Task<InteractiveAgentResult>;
```

## Contrats associés

- [InteractiveAgentResult](../interactiveagentresult/)
- [InteractiveAgentTaskOptions](../interactiveagenttaskoptions/)
- [Task](../type-task/)
