---
title: "HarnessContextInput"
description: "HarnessContextInput — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessContextInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                     | Présence | Rôle                                                                                                 |
| ----------- | -------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `messages`  | `readonly ModelMessage[]`                                | Requis   | Historique effectif sur le point d’être envoyé.                                                      |
| `step`      | `number`                                                 | Requis   | Numéro de l’étape en cours.                                                                          |
| `model`     | `AgentModel`                                             | Requis   | Modèle normalisé de l’agent.                                                                         |
| `signal`    | `AbortSignal`                                            | Requis   | Signal d’annulation de la passe.                                                                     |
| `summarize` | `(messages: readonly ModelMessage[]) => Promise<string>` | Requis   | Demande au modèle de l’agent un résumé factuel des messages donnés ; la requête compte dans l’usage. |

## Signature

```ts
export interface HarnessContextInput {
  readonly messages: readonly ModelMessage[];
  readonly step: number;
  readonly model: AgentModel;
  readonly signal: AbortSignal;
  summarize(messages: readonly ModelMessage[]): Promise<string>;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [ModelMessage](../modelmessage/)
