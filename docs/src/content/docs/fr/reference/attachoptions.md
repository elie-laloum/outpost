---
title: "AttachOptions"
description: "AttachOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AttachOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                                                                 | Présence  | Rôle                                                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ask`          | `VariableQuestion \| undefined`                                                                      | Optionnel | Fournit chaque variable {{name}} laissée sans valeur par un brief fichier, un appel par nom, avant l’ouverture du terminal. Sans ce callback, Outpost pose la question dans le terminal de l’hôte et rejette avec le code configuration quand stdin n’est pas un TTY. |
| `agent`        | `Agent \| undefined`                                                                                 | Optionnel | Agent CLI ouvert dans le terminal, à la place de l’agent de la sandbox pour cette session. Les agents du harness intégré, de rejeu et de secours sont rejetés avec le code configuration.                                                                             |
| `brief`        | `Brief \| undefined`                                                                                 | Optionnel | Premier message confié à l’agent : texte littéral ou brief lu depuis un fichier. Sans brief, le terminal s’ouvre sans message.                                                                                                                                        |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                     | Optionnel | Conversation native à rouvrir, par identifiant ; fork: true ouvre une copie et laisse l’originale intacte. Rejette avec le code configuration si l’agent ne sait pas reprendre ou bifurquer.                                                                          |
| `signal`       | `AbortSignal \| undefined`                                                                           | Optionnel | Son annulation arrête le processus de l’agent et rejette l’attach avec la raison du signal.                                                                                                                                                                           |
| `terminal`     | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optionnel | Flux utilisés à la place du terminal de l’hôte : input alimente l’agent, output et error reçoivent ce qu’il écrit. Omis, l’agent lit et écrit sur stdin et stdout du processus hôte.                                                                                  |

## Signature

```ts
export interface AttachOptions {
  readonly ask?: VariableQuestion;
  readonly agent?: Agent;
  readonly brief?: Brief;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
  readonly signal?: AbortSignal;
  readonly terminal?: Command["terminal"];
}
```

## Contrats associés

- [Agent](../type-agent/)
- [Brief](../brief/)
- [Command](../command/)
- [VariableQuestion](../variablequestion/)
