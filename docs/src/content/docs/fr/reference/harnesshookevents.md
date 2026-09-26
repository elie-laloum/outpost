---
title: "HarnessHookEvents"
description: "HarnessHookEvents — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le streaming n’est pas encore disponible ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessHookEvents } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                                             | Présence | Rôle                                                                         |
| --------------- | -------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `session-start` | `{ readonly prompt: string; }`                                                   | Requis   | Événement des hooks session-start : le prompt rendu.                         |
| `before-model`  | `{ readonly messages: readonly ModelMessage[]; }`                                | Requis   | Événement des hooks before-model : les messages sur le point d’être envoyés. |
| `after-model`   | `{ readonly result: ModelResult; }`                                              | Requis   | Événement des hooks after-model : le résultat du modèle.                     |
| `before-tool`   | `{ readonly call: ModelToolCallBlock; }`                                         | Requis   | Événement des hooks before-tool : l’appel validé.                            |
| `after-tool`    | `{ readonly call: ModelToolCallBlock; readonly result: HarnessToolResultView; }` | Requis   | Événement des hooks after-tool : l’appel et son issue.                       |
| `stop`          | `{ readonly text: string; }`                                                     | Requis   | Événement des hooks stop : le texte de la réponse finale.                    |

## Signature

```ts
export interface HarnessHookEvents {
  readonly "session-start": {
    readonly prompt: string;
  };
  readonly "before-model": {
    readonly messages: readonly ModelMessage[];
  };
  readonly "after-model": {
    readonly result: ModelResult;
  };
  readonly "before-tool": {
    readonly call: ModelToolCallBlock;
  };
  readonly "after-tool": {
    readonly call: ModelToolCallBlock;
    readonly result: HarnessToolResultView;
  };
  readonly stop: {
    readonly text: string;
  };
}
```

## Contrats associés

- [HarnessToolResultView](../harnesstoolresultview/)
- [ModelMessage](../modelmessage/)
- [ModelResult](../modelresult/)
- [ModelToolCallBlock](../modeltoolcallblock/)
