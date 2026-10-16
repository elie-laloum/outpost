---
title: "CopilotHookEvents"
description: "CopilotHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CopilotHookEvents } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                                                                                                                                                                                                                                                                         | Présence | Rôle                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionStart`          | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly source?: string; readonly initialPrompt?: string; }`                                                                                                                                                               | Requis   | Contenu natif de sessionStart fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.          |
| `sessionEnd`            | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly reason?: string; }`                                                                                                                                                                                                | Requis   | Contenu natif de sessionEnd fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.            |
| `userPromptSubmitted`   | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly prompt: string; }`                                                                                                                                                                                                 | Requis   | Contenu natif de userPromptSubmitted fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.   |
| `userPromptTransformed` | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly prompt: string; readonly transformedPrompt?: string; }`                                                                                                                                                            | Requis   | Contenu natif de userPromptTransformed fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution. |
| `preToolUse`            | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly toolName: string; readonly toolArgs?: unknown; }`                                                                                                                                                                  | Requis   | Contenu natif de preToolUse fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.            |
| `postToolUse`           | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly toolName: string; readonly toolArgs?: unknown; readonly toolResult?: unknown; }`                                                                                                                                   | Requis   | Contenu natif de postToolUse fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.           |
| `postToolUseFailure`    | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly toolName: string; readonly toolArgs?: unknown; readonly error?: unknown; }`                                                                                                                                        | Requis   | Contenu natif de postToolUseFailure fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.    |
| `permissionRequest`     | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly toolName: string; readonly toolArgs?: unknown; }`                                                                                                                                                                  | Requis   | Contenu natif de permissionRequest fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.     |
| `agentStop`             | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly stop_hook_active?: boolean; readonly transcriptPath?: string; readonly stopReason?: "end_turn"; }`                                                                                                                 | Requis   | Contenu natif de agentStop fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.             |
| `subagentStart`         | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly agentName?: string; readonly transcriptPath?: string; readonly agentDisplayName?: string; readonly agentDescription?: string; }`                                                                                   | Requis   | Contenu natif de subagentStart fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `subagentStop`          | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly agentName?: string; readonly agentId?: string; readonly agentType?: string; readonly transcriptPath?: string; readonly agentDisplayName?: string; readonly response?: string; readonly stopReason?: "end_turn"; }` | Requis   | Contenu natif de subagentStop fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.          |
| `preCompact`            | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly trigger?: "manual" \| "auto"; readonly transcriptPath?: string; readonly customInstructions?: string; }`                                                                                                           | Requis   | Contenu natif de preCompact fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.            |
| `notification`          | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly notification_type?: string; readonly message?: string; }`                                                                                                                                                          | Requis   | Contenu natif de notification fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.          |
| `errorOccurred`         | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly error?: { readonly message: string; readonly name: string; readonly stack?: string; }; readonly errorContext?: "model_call" \| "tool_execution" \| "system" \| "user_input"; readonly recoverable?: boolean; }`    | Requis   | Contenu natif de errorOccurred fourni par Copilot, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |

## Signature

```ts
export interface CopilotHookEvents {
  readonly sessionStart: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly source?: string;
    readonly initialPrompt?: string;
  };
  readonly sessionEnd: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly reason?: string;
  };
  readonly userPromptSubmitted: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly prompt: string;
  };
  readonly userPromptTransformed: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly prompt: string;
    readonly transformedPrompt?: string;
  };
  readonly preToolUse: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly toolName: string;
    readonly toolArgs?: unknown;
  };
  readonly postToolUse: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly toolName: string;
    readonly toolArgs?: unknown;
    readonly toolResult?: unknown;
  };
  readonly postToolUseFailure: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly toolName: string;
    readonly toolArgs?: unknown;
    readonly error?: unknown;
  };
  readonly permissionRequest: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly toolName: string;
    readonly toolArgs?: unknown;
  };
  readonly agentStop: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly stop_hook_active?: boolean;
    readonly transcriptPath?: string;
    readonly stopReason?: "end_turn";
  };
  readonly subagentStart: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly agentName?: string;
    readonly transcriptPath?: string;
    readonly agentDisplayName?: string;
    readonly agentDescription?: string;
  };
  readonly subagentStop: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly agentName?: string;
    readonly agentId?: string;
    readonly agentType?: string;
    readonly transcriptPath?: string;
    readonly agentDisplayName?: string;
    readonly response?: string;
    readonly stopReason?: "end_turn";
  };
  readonly preCompact: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly trigger?: "manual" | "auto";
    readonly transcriptPath?: string;
    readonly customInstructions?: string;
  };
  readonly notification: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly notification_type?: string;
    readonly message?: string;
  };
  readonly errorOccurred: {
    readonly sessionId: string;
    readonly timestamp: number;
    readonly cwd: string;
    readonly error?: {
      readonly message: string;
      readonly name: string;
      readonly stack?: string;
    };
    readonly errorContext?:
      "model_call" | "tool_execution" | "system" | "user_input";
    readonly recoverable?: boolean;
  };
}
```
