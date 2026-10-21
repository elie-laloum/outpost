---
title: "CopilotHookDecisions"
description: "CopilotHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CopilotHookDecisions } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom                     | Type                                                                                                                                                                                                        | Présence | Rôle                                                                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sessionStart`          | `{ readonly additionalContext?: string; }`                                                                                                                                                                  | Requis   | Sortie native acceptée pour sessionStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.          |
| `sessionEnd`            | `never`                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour sessionEnd ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.            |
| `userPromptSubmitted`   | `never`                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour userPromptSubmitted ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.   |
| `userPromptTransformed` | `{ readonly modifiedTransformedPrompt?: string; }`                                                                                                                                                          | Requis   | Sortie native acceptée pour userPromptTransformed ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif. |
| `preToolUse`            | `{ readonly permissionDecision?: "allow" \| "deny" \| "ask"; readonly permissionDecisionReason?: string; readonly modifiedArgs?: Readonly<Record<string, unknown>>; readonly additionalContext?: string; }` | Requis   | Sortie native acceptée pour preToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.            |
| `postToolUse`           | `{ readonly modifiedResult?: { readonly resultType: "success" \| "failure"; readonly textResultForLlm: string; }; readonly additionalContext?: string; }`                                                   | Requis   | Sortie native acceptée pour postToolUse ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.           |
| `postToolUseFailure`    | `{ readonly additionalContext?: string; }`                                                                                                                                                                  | Requis   | Sortie native acceptée pour postToolUseFailure ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.    |
| `permissionRequest`     | `{ readonly behavior?: "allow" \| "deny"; readonly message?: string; readonly interrupt?: boolean; }`                                                                                                       | Requis   | Sortie native acceptée pour permissionRequest ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.     |
| `agentStop`             | `{ readonly decision?: "block" \| "allow"; readonly reason?: string; }`                                                                                                                                     | Requis   | Sortie native acceptée pour agentStop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.             |
| `subagentStart`         | `{ readonly additionalContext?: string; }`                                                                                                                                                                  | Requis   | Sortie native acceptée pour subagentStart ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |
| `subagentStop`          | `{ readonly decision?: "block" \| "allow"; readonly reason?: string; readonly modifiedResponse?: string; }`                                                                                                 | Requis   | Sortie native acceptée pour subagentStop ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.          |
| `preCompact`            | `never`                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour preCompact ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.            |
| `notification`          | `{ readonly additionalContext?: string; }`                                                                                                                                                                  | Requis   | Sortie native acceptée pour notification ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.          |
| `errorOccurred`         | `never`                                                                                                                                                                                                     | Requis   | Sortie native acceptée pour errorOccurred ; never indique que cet événement n’accepte aucune décision de callback. Un retour vide conserve le déroulement natif.         |

## Signature

```ts
export interface CopilotHookDecisions {
  readonly sessionStart: {
    readonly additionalContext?: string;
  };
  readonly sessionEnd: never;
  readonly userPromptSubmitted: never;
  readonly userPromptTransformed: {
    readonly modifiedTransformedPrompt?: string;
  };
  readonly preToolUse: {
    readonly permissionDecision?: "allow" | "deny" | "ask";
    readonly permissionDecisionReason?: string;
    readonly modifiedArgs?: Readonly<Record<string, unknown>>;
    readonly additionalContext?: string;
  };
  readonly postToolUse: {
    readonly modifiedResult?: {
      readonly resultType: "success" | "failure";
      readonly textResultForLlm: string;
    };
    readonly additionalContext?: string;
  };
  readonly postToolUseFailure: {
    readonly additionalContext?: string;
  };
  readonly permissionRequest: {
    readonly behavior?: "allow" | "deny";
    readonly message?: string;
    readonly interrupt?: boolean;
  };
  readonly agentStop: {
    readonly decision?: "block" | "allow";
    readonly reason?: string;
  };
  readonly subagentStart: {
    readonly additionalContext?: string;
  };
  readonly subagentStop: {
    readonly decision?: "block" | "allow";
    readonly reason?: string;
    readonly modifiedResponse?: string;
  };
  readonly preCompact: never;
  readonly notification: {
    readonly additionalContext?: string;
  };
  readonly errorOccurred: never;
}
```
