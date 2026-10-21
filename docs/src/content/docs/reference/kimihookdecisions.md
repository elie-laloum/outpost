---
title: "KimiHookDecisions"
description: "KimiHookDecisions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { KimiHookDecisions } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name                 | Type                                                                                                                                | Presence | Meaning                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `UserPromptSubmit`   | `string \| { readonly hookSpecificOutput?: { readonly permissionDecision: "deny"; readonly permissionDecisionReason?: string; }; }` | Required | Accepted native output for UserPromptSubmit; never means this event accepts no callback decision. Returning nothing preserves the native flow.   |
| `UserPromptQueued`   | `never`                                                                                                                             | Required | Accepted native output for UserPromptQueued; never means this event accepts no callback decision. Returning nothing preserves the native flow.   |
| `PreToolUse`         | `string \| { readonly hookSpecificOutput?: { readonly permissionDecision: "deny"; readonly permissionDecisionReason?: string; }; }` | Required | Accepted native output for PreToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `Stop`               | `string \| { readonly hookSpecificOutput?: { readonly permissionDecision: "deny"; readonly permissionDecisionReason?: string; }; }` | Required | Accepted native output for Stop; never means this event accepts no callback decision. Returning nothing preserves the native flow.               |
| `TurnStarted`        | `never`                                                                                                                             | Required | Accepted native output for TurnStarted; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `PostToolUse`        | `never`                                                                                                                             | Required | Accepted native output for PostToolUse; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `PostToolUseFailure` | `never`                                                                                                                             | Required | Accepted native output for PostToolUseFailure; never means this event accepts no callback decision. Returning nothing preserves the native flow. |
| `PermissionRequest`  | `never`                                                                                                                             | Required | Accepted native output for PermissionRequest; never means this event accepts no callback decision. Returning nothing preserves the native flow.  |
| `PermissionResult`   | `never`                                                                                                                             | Required | Accepted native output for PermissionResult; never means this event accepts no callback decision. Returning nothing preserves the native flow.   |
| `SessionStart`       | `never`                                                                                                                             | Required | Accepted native output for SessionStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.       |
| `SessionEnd`         | `never`                                                                                                                             | Required | Accepted native output for SessionEnd; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `SessionHeartbeat`   | `never`                                                                                                                             | Required | Accepted native output for SessionHeartbeat; never means this event accepts no callback decision. Returning nothing preserves the native flow.   |
| `SubagentStart`      | `never`                                                                                                                             | Required | Accepted native output for SubagentStart; never means this event accepts no callback decision. Returning nothing preserves the native flow.      |
| `SubagentStop`       | `never`                                                                                                                             | Required | Accepted native output for SubagentStop; never means this event accepts no callback decision. Returning nothing preserves the native flow.       |
| `TaskStarted`        | `never`                                                                                                                             | Required | Accepted native output for TaskStarted; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `StopFailure`        | `never`                                                                                                                             | Required | Accepted native output for StopFailure; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `Interrupt`          | `never`                                                                                                                             | Required | Accepted native output for Interrupt; never means this event accepts no callback decision. Returning nothing preserves the native flow.          |
| `PreCompact`         | `never`                                                                                                                             | Required | Accepted native output for PreCompact; never means this event accepts no callback decision. Returning nothing preserves the native flow.         |
| `PostCompact`        | `never`                                                                                                                             | Required | Accepted native output for PostCompact; never means this event accepts no callback decision. Returning nothing preserves the native flow.        |
| `Notification`       | `never`                                                                                                                             | Required | Accepted native output for Notification; never means this event accepts no callback decision. Returning nothing preserves the native flow.       |

## Signature

```ts
export interface KimiHookDecisions {
  readonly UserPromptSubmit:
    | string
    | {
        readonly hookSpecificOutput?: {
          readonly permissionDecision: "deny";
          readonly permissionDecisionReason?: string;
        };
      };
  readonly UserPromptQueued: never;
  readonly PreToolUse:
    | string
    | {
        readonly hookSpecificOutput?: {
          readonly permissionDecision: "deny";
          readonly permissionDecisionReason?: string;
        };
      };
  readonly Stop:
    | string
    | {
        readonly hookSpecificOutput?: {
          readonly permissionDecision: "deny";
          readonly permissionDecisionReason?: string;
        };
      };
  readonly TurnStarted: never;
  readonly PostToolUse: never;
  readonly PostToolUseFailure: never;
  readonly PermissionRequest: never;
  readonly PermissionResult: never;
  readonly SessionStart: never;
  readonly SessionEnd: never;
  readonly SessionHeartbeat: never;
  readonly SubagentStart: never;
  readonly SubagentStop: never;
  readonly TaskStarted: never;
  readonly StopFailure: never;
  readonly Interrupt: never;
  readonly PreCompact: never;
  readonly PostCompact: never;
  readonly Notification: never;
}
```
