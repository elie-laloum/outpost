---
title: "CodexHookDecisions"
description: "CodexHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexHookDecisions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                                                                                                                                                                                                                                                                                                                                | Presence | Meaning                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`      | `string \| { readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SessionStart"; readonly additionalContext?: string; }; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`           | Required | Accepted native output for SessionStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.      |
| `SessionEnd`        | `never`                                                                                                                                                                                                                                                                                                                                                             | Required | Accepted native output for SessionEnd; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `UserPromptSubmit`  | `string \| { readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "UserPromptSubmit"; readonly additionalContext?: string; }; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`       | Required | Accepted native output for UserPromptSubmit; never means this event accepts no callback decision. Returning nothing preserves the native flow.  |
| `PreToolUse`        | `{ readonly systemMessage?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PreToolUse"; readonly permissionDecision?: "allow" \| "deny"; readonly permissionDecisionReason?: string; readonly updatedInput?: Readonly<Record<string, unknown>>; readonly additionalContext?: string; }; }` | Required | Accepted native output for PreToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `PermissionRequest` | `{ readonly systemMessage?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PermissionRequest"; readonly decision?: { readonly behavior: "allow" \| "deny"; readonly message?: string; }; }; }`                                                                                                                                                    | Required | Accepted native output for PermissionRequest; never means this event accepts no callback decision. Returning nothing preserves the native flow. |
| `PostToolUse`       | `{ readonly systemMessage?: string; readonly continue?: boolean; readonly stopReason?: string; readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "PostToolUse"; readonly additionalContext?: string; }; }`                                                                                             | Required | Accepted native output for PostToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.       |
| `PreCompact`        | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                            | Required | Accepted native output for PreCompact; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `PostCompact`       | `{ readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                                                                            | Required | Accepted native output for PostCompact; never means this event accepts no callback decision. Returning nothing preserves the native flow.       |
| `SubagentStart`     | `string \| { readonly decision?: "block"; readonly reason?: string; readonly hookSpecificOutput?: { readonly hookEventName: "SubagentStart"; readonly additionalContext?: string; }; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`          | Required | Accepted native output for SubagentStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.     |
| `SubagentStop`      | `{ readonly decision?: "block"; readonly reason?: string; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                     | Required | Accepted native output for SubagentStop; never means this event accepts no callback decision. Returning nothing preserves the native flow.      |
| `Stop`              | `{ readonly decision?: "block"; readonly reason?: string; readonly continue?: boolean; readonly stopReason?: string; readonly suppressOutput?: boolean; readonly systemMessage?: string; readonly terminalSequence?: string; }`                                                                                                                                     | Required | Accepted native output for Stop; never means this event accepts no callback decision. Returning nothing preserves the native flow.              |
| `Interrupt`         | `{ readonly systemMessage?: string; }`                                                                                                                                                                                                                                                                                                                              | Required | Accepted native output for Interrupt; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |

## Signature

```ts
export interface CodexHookDecisions {
  readonly SessionStart:
    | string
    | {
        readonly decision?: "block";
        readonly reason?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "SessionStart";
          readonly additionalContext?: string;
        };
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly terminalSequence?: string;
      };
  readonly SessionEnd: never;
  readonly UserPromptSubmit:
    | string
    | {
        readonly decision?: "block";
        readonly reason?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "UserPromptSubmit";
          readonly additionalContext?: string;
        };
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly terminalSequence?: string;
      };
  readonly PreToolUse: {
    readonly systemMessage?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PreToolUse";
      readonly permissionDecision?: "allow" | "deny";
      readonly permissionDecisionReason?: string;
      readonly updatedInput?: Readonly<Record<string, unknown>>;
      readonly additionalContext?: string;
    };
  };
  readonly PermissionRequest: {
    readonly systemMessage?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PermissionRequest";
      readonly decision?: {
        readonly behavior: "allow" | "deny";
        readonly message?: string;
      };
    };
  };
  readonly PostToolUse: {
    readonly systemMessage?: string;
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly decision?: "block";
    readonly reason?: string;
    readonly hookSpecificOutput?: {
      readonly hookEventName: "PostToolUse";
      readonly additionalContext?: string;
    };
  };
  readonly PreCompact: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly PostCompact: {
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly SubagentStart:
    | string
    | {
        readonly decision?: "block";
        readonly reason?: string;
        readonly hookSpecificOutput?: {
          readonly hookEventName: "SubagentStart";
          readonly additionalContext?: string;
        };
        readonly continue?: boolean;
        readonly stopReason?: string;
        readonly suppressOutput?: boolean;
        readonly systemMessage?: string;
        readonly terminalSequence?: string;
      };
  readonly SubagentStop: {
    readonly decision?: "block";
    readonly reason?: string;
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly Stop: {
    readonly decision?: "block";
    readonly reason?: string;
    readonly continue?: boolean;
    readonly stopReason?: string;
    readonly suppressOutput?: boolean;
    readonly systemMessage?: string;
    readonly terminalSequence?: string;
  };
  readonly Interrupt: {
    readonly systemMessage?: string;
  };
}
```
