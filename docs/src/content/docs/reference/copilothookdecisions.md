---
title: "CopilotHookDecisions"
description: "CopilotHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CopilotHookDecisions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                                                                                                                                        | Presence | Meaning                                                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionStart`          | `{ readonly additionalContext?: string; }`                                                                                                                                                                  | Required | Accepted native output for sessionStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.          |
| `sessionEnd`            | `never`                                                                                                                                                                                                     | Required | Accepted native output for sessionEnd; never means this event accepts no callback decision. Returning nothing preserves the native flow.            |
| `userPromptSubmitted`   | `never`                                                                                                                                                                                                     | Required | Accepted native output for userPromptSubmitted; never means this event accepts no callback decision. Returning nothing preserves the native flow.   |
| `userPromptTransformed` | `{ readonly modifiedTransformedPrompt?: string; }`                                                                                                                                                          | Required | Accepted native output for userPromptTransformed; never means this event accepts no callback decision. Returning nothing preserves the native flow. |
| `preToolUse`            | `{ readonly permissionDecision?: "allow" \| "deny" \| "ask"; readonly permissionDecisionReason?: string; readonly modifiedArgs?: Readonly<Record<string, unknown>>; readonly additionalContext?: string; }` | Required | Accepted native output for preToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.            |
| `postToolUse`           | `{ readonly modifiedResult?: { readonly resultType: "success" \| "failure"; readonly textResultForLlm: string; }; readonly additionalContext?: string; }`                                                   | Required | Accepted native output for postToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.           |
| `postToolUseFailure`    | `{ readonly additionalContext?: string; }`                                                                                                                                                                  | Required | Accepted native output for postToolUseFailure; never means this event accepts no callback decision. Returning nothing preserves the native flow.    |
| `permissionRequest`     | `{ readonly behavior?: "allow" \| "deny"; readonly message?: string; readonly interrupt?: boolean; }`                                                                                                       | Required | Accepted native output for permissionRequest; never means this event accepts no callback decision. Returning nothing preserves the native flow.     |
| `agentStop`             | `{ readonly decision?: "block" \| "allow"; readonly reason?: string; }`                                                                                                                                     | Required | Accepted native output for agentStop; never means this event accepts no callback decision. Returning nothing preserves the native flow.             |
| `subagentStart`         | `{ readonly additionalContext?: string; }`                                                                                                                                                                  | Required | Accepted native output for subagentStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `subagentStop`          | `{ readonly decision?: "block" \| "allow"; readonly reason?: string; readonly modifiedResponse?: string; }`                                                                                                 | Required | Accepted native output for subagentStop; never means this event accepts no callback decision. Returning nothing preserves the native flow.          |
| `preCompact`            | `never`                                                                                                                                                                                                     | Required | Accepted native output for preCompact; never means this event accepts no callback decision. Returning nothing preserves the native flow.            |
| `notification`          | `{ readonly additionalContext?: string; }`                                                                                                                                                                  | Required | Accepted native output for notification; never means this event accepts no callback decision. Returning nothing preserves the native flow.          |
| `errorOccurred`         | `never`                                                                                                                                                                                                     | Required | Accepted native output for errorOccurred; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |

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
