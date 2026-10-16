---
title: "NativeHookOptions"
description: "NativeHookOptions — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom         | Type                                                                                                                 | Présence          | Rôle                                                                                                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on`        | `Phase`                                                                                                              | Requis            | Nom natif de l’événement ; détermine son contenu et les réponses acceptées.                                                                                                                                                  |
| `name`      | `string \| undefined`                                                                                                | Optionnel         | Nom de diagnostic optionnel ; utilise par défaut le nom natif de l’événement.                                                                                                                                                |
| `matcher`   | `string \| undefined`                                                                                                | Optionnel         | Filtre natif interprété par la CLI sélectionnée. Omettez-le pour recevoir toutes les occurrences prises en charge par cet événement.                                                                                         |
| `timeoutMs` | `number \| undefined`                                                                                                | Optionnel         | Délai positif du callback ou de la commande en millisecondes ; 30000 par défaut, 600000 au maximum. Les limites natives de l’événement restent applicables.                                                                  |
| `command`   | `HookCommand \| undefined`                                                                                           | Selon la variante | Exécutable lancé dans le sandbox avec le JSON natif sur stdin. Stdout, stderr et le code de sortie conservent leur sens natif. Exclusif avec run.                                                                            |
| `run`       | `undefined \| (context: AgentHookContext & { readonly event: Event; }) => Result \| void \| Promise<Result \| void>` | Selon la variante | Callback hôte recevant l’événement natif, un sandbox emprunté et un signal d’annulation. Sans retour, conserve le comportement natif ; les décisions doivent être prises en charge par cet événement. Exclusif avec command. |

## Signature

```ts
export type NativeHookOptions<Phase extends string, Event, Result> = {
  readonly on: Phase;
  readonly name?: string;
  readonly matcher?: string;
  readonly timeoutMs?: number;
} & (
  | {
      readonly command: HookCommand;
      readonly run?: never;
    }
  | {
      readonly command?: never;
      run(
        context: AgentHookContext & {
          readonly event: Event;
        },
      ): Result | void | Promise<Result | void>;
    }
);
```

## Contrats associés

- [AgentHookContext](../agenthookcontext/)
- [HookCommand](../hookcommand/)
