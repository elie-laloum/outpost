---
title: "CopilotHookEvents"
description: "CopilotHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CopilotHookEvents } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name                    | Type                                                                                                                                                                                                                                                                                                         | Presence | Meaning                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionStart`          | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly source?: string; readonly initialPrompt?: string; }`                                                                                                                                                               | Required | Native sessionStart payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.          |
| `sessionEnd`            | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly reason?: string; }`                                                                                                                                                                                                | Required | Native sessionEnd payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.            |
| `userPromptSubmitted`   | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly prompt: string; }`                                                                                                                                                                                                 | Required | Native userPromptSubmitted payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.   |
| `userPromptTransformed` | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly prompt: string; readonly transformedPrompt?: string; }`                                                                                                                                                            | Required | Native userPromptTransformed payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime. |
| `preToolUse`            | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly toolName: string; readonly toolArgs?: unknown; }`                                                                                                                                                                  | Required | Native preToolUse payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.            |
| `postToolUse`           | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly toolName: string; readonly toolArgs?: unknown; readonly toolResult?: unknown; }`                                                                                                                                   | Required | Native postToolUse payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.           |
| `postToolUseFailure`    | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly toolName: string; readonly toolArgs?: unknown; readonly error?: unknown; }`                                                                                                                                        | Required | Native postToolUseFailure payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.    |
| `permissionRequest`     | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly toolName: string; readonly toolArgs?: unknown; }`                                                                                                                                                                  | Required | Native permissionRequest payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.     |
| `agentStop`             | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly stop_hook_active?: boolean; readonly transcriptPath?: string; readonly stopReason?: "end_turn"; }`                                                                                                                 | Required | Native agentStop payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.             |
| `subagentStart`         | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly agentName?: string; readonly transcriptPath?: string; readonly agentDisplayName?: string; readonly agentDescription?: string; }`                                                                                   | Required | Native subagentStart payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `subagentStop`          | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly agentName?: string; readonly agentId?: string; readonly agentType?: string; readonly transcriptPath?: string; readonly agentDisplayName?: string; readonly response?: string; readonly stopReason?: "end_turn"; }` | Required | Native subagentStop payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.          |
| `preCompact`            | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly trigger?: "manual" \| "auto"; readonly transcriptPath?: string; readonly customInstructions?: string; }`                                                                                                           | Required | Native preCompact payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.            |
| `notification`          | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly notification_type?: string; readonly message?: string; }`                                                                                                                                                          | Required | Native notification payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.          |
| `errorOccurred`         | `{ readonly sessionId: string; readonly timestamp: number; readonly cwd: string; readonly error?: { readonly message: string; readonly name: string; readonly stack?: string; }; readonly errorContext?: "model_call" \| "tool_execution" \| "system" \| "user_input"; readonly recoverable?: boolean; }`    | Required | Native errorOccurred payload from Copilot, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |

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
