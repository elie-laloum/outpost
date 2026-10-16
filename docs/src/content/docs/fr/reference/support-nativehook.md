---
title: "NativeHook"
description: "NativeHook — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom         | Type                                                             | Présence  | Rôle                                                                                                                                                                                                                         |
| ----------- | ---------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`      | `"native-hook"`                                                  | Requis    | Discriminant identifiant un hook CLI natif.                                                                                                                                                                                  |
| `agent`     | `Agent`                                                          | Requis    | Protocole CLI propriétaire de ce hook ; un autre harness CLI le refuse.                                                                                                                                                      |
| `on`        | `Phase`                                                          | Requis    | Nom natif de l’événement ; détermine son contenu et les réponses acceptées.                                                                                                                                                  |
| `name`      | `string`                                                         | Requis    | Nom de diagnostic optionnel ; utilise par défaut le nom natif de l’événement.                                                                                                                                                |
| `timeoutMs` | `number`                                                         | Requis    | Délai positif du callback ou de la commande en millisecondes ; 30000 par défaut, 600000 au maximum. Les limites natives de l’événement restent applicables.                                                                  |
| `command`   | `HookCommand \| undefined`                                       | Optionnel | Exécutable lancé dans le sandbox avec le JSON natif sur stdin. Stdout, stderr et le code de sortie conservent leur sens natif. Exclusif avec run.                                                                            |
| `matcher`   | `string \| undefined`                                            | Optionnel | Filtre natif interprété par la CLI sélectionnée. Omettez-le pour recevoir toutes les occurrences prises en charge par cet événement.                                                                                         |
| `run`       | `(event: unknown, context: AgentHookContext) => Promise<string>` | Requis    | Callback hôte recevant l’événement natif, un sandbox emprunté et un signal d’annulation. Sans retour, conserve le comportement natif ; les décisions doivent être prises en charge par cet événement. Exclusif avec command. |

## Signature

```ts
export interface NativeHook<
  Agent extends string,
  Phase extends string = string,
> extends AgentHookHandler {
  readonly kind: "native-hook";
  readonly agent: Agent;
  readonly on: Phase;
}
```

## Contrats associés

- [AgentHookHandler](../support-agenthookhandler/)
