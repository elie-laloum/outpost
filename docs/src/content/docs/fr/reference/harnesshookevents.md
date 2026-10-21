---
title: "HarnessHookEvents"
description: "HarnessHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHookEvents } from "@elie-laloum/outpost/harness";
```

## Paramètres et propriétés

| Nom                 | Type                                                                                                                                                         | Présence | Rôle                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `session-start`     | `{ readonly prompt: string; readonly source?: "start" \| "resume" \| "repair"; }`                                                                            | Requis   | Événement des hooks session-start : le prompt rendu.                                                                   |
| `before-prompt`     | `{ readonly prompt: string; readonly source: "initial" \| "steering"; }`                                                                                     | Requis   | Contexte fourni à la phase before-prompt ; les valeurs sont copiées et figées avant leur transmission au callback.     |
| `before-model`      | `{ readonly messages: readonly ModelMessage[]; readonly system?: string; }`                                                                                  | Requis   | Événement des hooks before-model : les messages sur le point d’être envoyés.                                           |
| `after-model`       | `{ readonly result: ModelResult; }`                                                                                                                          | Requis   | Événement des hooks after-model : le résultat du modèle.                                                               |
| `model-error`       | `{ readonly error: unknown; }`                                                                                                                               | Requis   | Contexte fourni à la phase model-error ; les valeurs sont copiées et figées avant leur transmission au callback.       |
| `before-compaction` | `{ readonly messages: readonly ModelMessage[]; readonly strategy: string; }`                                                                                 | Requis   | Contexte fourni à la phase before-compaction ; les valeurs sont copiées et figées avant leur transmission au callback. |
| `after-compaction`  | `{ readonly messages: readonly ModelMessage[]; readonly strategy: string; }`                                                                                 | Requis   | Contexte fourni à la phase after-compaction ; les valeurs sont copiées et figées avant leur transmission au callback.  |
| `before-subagent`   | `{ readonly id: string; readonly name: string; readonly callId: string; readonly prompt: string; }`                                                          | Requis   | Contexte fourni à la phase before-subagent ; les valeurs sont copiées et figées avant leur transmission au callback.   |
| `after-subagent`    | `{ readonly id: string; readonly name: string; readonly callId: string; readonly text?: string; readonly error?: unknown; readonly conversation?: string; }` | Requis   | Contexte fourni à la phase after-subagent ; les valeurs sont copiées et figées avant leur transmission au callback.    |
| `run-end`           | `{ readonly reason: "success" \| "error" \| "aborted" \| "timeout" \| "limit"; readonly text?: string; readonly error?: unknown; }`                          | Requis   | Contexte fourni à la phase run-end ; les valeurs sont copiées et figées avant leur transmission au callback.           |
| `before-tool`       | `{ readonly call: ModelToolCallBlock; }`                                                                                                                     | Requis   | Événement des hooks before-tool : l’appel validé.                                                                      |
| `after-tool`        | `{ readonly call: ModelToolCallBlock; readonly result: HarnessToolResultView; readonly status?: "success" \| "denied" \| "error"; }`                         | Requis   | Événement des hooks after-tool : l’appel et son issue.                                                                 |
| `stop`              | `{ readonly text: string; }`                                                                                                                                 | Requis   | Événement des hooks stop : le texte de la réponse finale.                                                              |

## Signature

```ts
export interface HarnessHookEvents {
  readonly "session-start": {
    readonly prompt: string;
    readonly source?: "start" | "resume" | "repair";
  };
  readonly "before-prompt": {
    readonly prompt: string;
    readonly source: "initial" | "steering";
  };
  readonly "before-model": {
    readonly messages: readonly ModelMessage[];
    readonly system?: string;
  };
  readonly "after-model": {
    readonly result: ModelResult;
  };
  readonly "model-error": {
    readonly error: unknown;
  };
  readonly "before-compaction": {
    readonly messages: readonly ModelMessage[];
    readonly strategy: string;
  };
  readonly "after-compaction": {
    readonly messages: readonly ModelMessage[];
    readonly strategy: string;
  };
  readonly "before-subagent": {
    readonly id: string;
    readonly name: string;
    readonly callId: string;
    readonly prompt: string;
  };
  readonly "after-subagent": {
    readonly id: string;
    readonly name: string;
    readonly callId: string;
    readonly text?: string;
    readonly error?: unknown;
    readonly conversation?: string;
  };
  readonly "run-end": {
    readonly reason: "success" | "error" | "aborted" | "timeout" | "limit";
    readonly text?: string;
    readonly error?: unknown;
  };
  readonly "before-tool": {
    readonly call: ModelToolCallBlock;
  };
  readonly "after-tool": {
    readonly call: ModelToolCallBlock;
    readonly result: HarnessToolResultView;
    readonly status?: "success" | "denied" | "error";
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
