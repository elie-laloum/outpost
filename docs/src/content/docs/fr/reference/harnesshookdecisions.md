---
title: "HarnessHookDecisions"
description: "HarnessHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHookDecisions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                                                                                                      | Présence | Rôle                                                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-start`     | `{ readonly instructions: string; }`                                                                                      | Requis   | Renvoyez { instructions } pour ajouter du texte aux instructions système du tour.                                                                                                                                                                   |
| `before-prompt`     | `{ readonly prompt: string; } \| { readonly deny: string; }`                                                              | Requis   | Seule la transformation explicite de before-prompt décrite par ce type est acceptée. never interdit une décision ; une exception fait échouer l’exécution sauf pendant le signalement d’un échec existant.                                          |
| `before-model`      | `{ readonly messages?: readonly ModelMessage[]; readonly system?: string; }`                                              | Requis   | Remplace les messages ou instructions système de cette requête. La validation conserve le raisonnement rejouable ; les instructions de réponse typée restent finales.                                                                               |
| `after-model`       | `{ readonly result: Pick<ModelResult, "text" \| "content"> & { readonly usage?: never; readonly stopReason?: never; }; }` | Requis   | Remplace le texte et éventuellement le contenu transmis à la boucle. Usage original, refus et limites de sortie restent effectifs ; les outils injectés exigent toujours leurs permissions.                                                         |
| `model-error`       | `never`                                                                                                                   | Requis   | Seule la transformation explicite de model-error décrite par ce type est acceptée. never interdit une décision ; une exception fait échouer l’exécution sauf pendant le signalement d’un échec existant.                                            |
| `before-compaction` | `{ readonly messages: readonly ModelMessage[]; }`                                                                         | Requis   | Seule la transformation explicite de before-compaction décrite par ce type est acceptée. never interdit une décision ; une exception fait échouer l’exécution sauf pendant le signalement d’un échec existant.                                      |
| `after-compaction`  | `{ readonly messages: readonly ModelMessage[]; }`                                                                         | Requis   | Seule la transformation explicite de after-compaction décrite par ce type est acceptée. never interdit une décision ; une exception fait échouer l’exécution sauf pendant le signalement d’un échec existant.                                       |
| `before-subagent`   | `{ readonly prompt: string; } \| { readonly deny: string; }`                                                              | Requis   | Seule la transformation explicite de before-subagent décrite par ce type est acceptée. never interdit une décision ; une exception fait échouer l’exécution sauf pendant le signalement d’un échec existant.                                        |
| `after-subagent`    | `{ readonly text: string; }`                                                                                              | Requis   | Seule la transformation explicite de after-subagent décrite par ce type est acceptée. never interdit une décision ; une exception fait échouer l’exécution sauf pendant le signalement d’un échec existant.                                         |
| `run-end`           | `never`                                                                                                                   | Requis   | Seule la transformation explicite de run-end décrite par ce type est acceptée. never interdit une décision ; une exception fait échouer l’exécution sauf pendant le signalement d’un échec existant.                                                |
| `before-tool`       | `{ readonly deny: string; } \| { readonly input: unknown; }`                                                              | Requis   | Renvoyez { deny } avec une raison non vide pour refuser l’appel et ignorer les hooks suivants, ou { input } pour transmettre une entrée de remplacement au hook suivant. L’entrée finale est validée puis contrôlée de nouveau par les permissions. |
| `after-tool`        | `{ readonly result: ToolOutput; }`                                                                                        | Requis   | Renvoyez { result } avec du texte ou { content, isError } pour remplacer ce que reçoit le modèle ; les hooks suivants voient le remplacement.                                                                                                       |
| `stop`              | `{ readonly continue: string; }`                                                                                          | Requis   | Renvoyez { continue } avec un message non vide pour refuser la réponse finale ; le message devient le message utilisateur suivant et les hooks stop suivants sont ignorés. Borné par maxSteps.                                                      |

## Signature

```ts
export interface HarnessHookDecisions {
  readonly "session-start": {
    readonly instructions: string;
  };
  readonly "before-prompt":
    | {
        readonly prompt: string;
      }
    | {
        readonly deny: string;
      };
  readonly "before-model": {
    readonly messages?: readonly ModelMessage[];
    readonly system?: string;
  };
  readonly "after-model": {
    readonly result: Pick<ModelResult, "text" | "content"> & {
      readonly usage?: never;
      readonly stopReason?: never;
    };
  };
  readonly "model-error": never;
  readonly "before-compaction": {
    readonly messages: readonly ModelMessage[];
  };
  readonly "after-compaction": {
    readonly messages: readonly ModelMessage[];
  };
  readonly "before-subagent":
    | {
        readonly prompt: string;
      }
    | {
        readonly deny: string;
      };
  readonly "after-subagent": {
    readonly text: string;
  };
  readonly "run-end": never;
  readonly "before-tool":
    | {
        readonly deny: string;
      }
    | {
        readonly input: unknown;
      };
  readonly "after-tool": {
    readonly result: ToolOutput;
  };
  readonly stop: {
    readonly continue: string;
  };
}
```

## Contrats associés

- [ModelMessage](../modelmessage/)
- [ModelResult](../modelresult/)
- [ToolOutput](../tooloutput/)
