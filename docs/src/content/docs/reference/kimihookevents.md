---
title: "KimiHookEvents"
description: "KimiHookEvents — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { KimiHookEvents } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name                 | Type                                                                                                                                                                                                                                                                                    | Presence | Meaning                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserPromptSubmit`   | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "UserPromptSubmit"; readonly prompt: string; }`                                                                                         | Required | Native UserPromptSubmit payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.   |
| `UserPromptQueued`   | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "UserPromptQueued"; readonly prompt_id?: string; readonly prompt: string; readonly queue_length?: number; }`                            | Required | Native UserPromptQueued payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.   |
| `PreToolUse`         | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PreToolUse"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_call_id?: string; }`   | Required | Native PreToolUse payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `Stop`               | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "Stop"; readonly stop_hook_active?: boolean; }`                                                                                         | Required | Native Stop payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.               |
| `TurnStarted`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "TurnStarted"; readonly turn_id?: string; readonly origin_kind?: string; readonly origin_name?: string; readonly prompt: string; }`     | Required | Native TurnStarted payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `PostToolUse`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PostToolUse"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_output?: unknown; }`  | Required | Native PostToolUse payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `PostToolUseFailure` | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PostToolUseFailure"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly error?: string; }`  | Required | Native PostToolUseFailure payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime. |
| `PermissionRequest`  | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PermissionRequest"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; }`                            | Required | Native PermissionRequest payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.  |
| `PermissionResult`   | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PermissionResult"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly decision?: string; }` | Required | Native PermissionResult payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.   |
| `SessionStart`       | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SessionStart"; readonly source?: string; readonly model?: string; readonly profile?: string; }`                                        | Required | Native SessionStart payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.       |
| `SessionEnd`         | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SessionEnd"; readonly reason?: string; }`                                                                                              | Required | Native SessionEnd payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `SessionHeartbeat`   | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SessionHeartbeat"; readonly uptime_ms?: number; }`                                                                                     | Required | Native SessionHeartbeat payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.   |
| `SubagentStart`      | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SubagentStart"; readonly agent_name?: string; readonly prompt: string; }`                                                              | Required | Native SubagentStart payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.      |
| `SubagentStop`       | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SubagentStop"; readonly agent_name?: string; readonly response?: string; }`                                                            | Required | Native SubagentStop payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.       |
| `TaskStarted`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "TaskStarted"; readonly task_id?: string; readonly description?: string; readonly detached?: boolean; }`                                | Required | Native TaskStarted payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `StopFailure`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "StopFailure"; readonly error_type?: string; readonly error_message?: string; }`                                                        | Required | Native StopFailure payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `Interrupt`          | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "Interrupt"; readonly reason?: string; }`                                                                                               | Required | Native Interrupt payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.          |
| `PreCompact`         | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PreCompact"; readonly trigger?: string; }`                                                                                             | Required | Native PreCompact payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.         |
| `PostCompact`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PostCompact"; readonly trigger?: string; }`                                                                                            | Required | Native PostCompact payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.        |
| `Notification`       | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "Notification"; readonly notification_type?: string; readonly title?: string; readonly body?: string; }`                                | Required | Native Notification payload from Kimi, retained with its original field names. Unknown additional native fields are tolerated at runtime.       |

## Signature

```ts
export interface KimiHookEvents {
  readonly UserPromptSubmit: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "UserPromptSubmit";
    readonly prompt: string;
  };
  readonly UserPromptQueued: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "UserPromptQueued";
    readonly prompt_id?: string;
    readonly prompt: string;
    readonly queue_length?: number;
  };
  readonly PreToolUse: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "PreToolUse";
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly tool_call_id?: string;
  };
  readonly Stop: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "Stop";
    readonly stop_hook_active?: boolean;
  };
  readonly TurnStarted: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "TurnStarted";
    readonly turn_id?: string;
    readonly origin_kind?: string;
    readonly origin_name?: string;
    readonly prompt: string;
  };
  readonly PostToolUse: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "PostToolUse";
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly tool_output?: unknown;
  };
  readonly PostToolUseFailure: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "PostToolUseFailure";
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly error?: string;
  };
  readonly PermissionRequest: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "PermissionRequest";
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
  };
  readonly PermissionResult: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "PermissionResult";
    readonly tool_name: string;
    readonly tool_input?: Readonly<Record<string, unknown>>;
    readonly decision?: string;
  };
  readonly SessionStart: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "SessionStart";
    readonly source?: string;
    readonly model?: string;
    readonly profile?: string;
  };
  readonly SessionEnd: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "SessionEnd";
    readonly reason?: string;
  };
  readonly SessionHeartbeat: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "SessionHeartbeat";
    readonly uptime_ms?: number;
  };
  readonly SubagentStart: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "SubagentStart";
    readonly agent_name?: string;
    readonly prompt: string;
  };
  readonly SubagentStop: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "SubagentStop";
    readonly agent_name?: string;
    readonly response?: string;
  };
  readonly TaskStarted: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "TaskStarted";
    readonly task_id?: string;
    readonly description?: string;
    readonly detached?: boolean;
  };
  readonly StopFailure: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "StopFailure";
    readonly error_type?: string;
    readonly error_message?: string;
  };
  readonly Interrupt: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "Interrupt";
    readonly reason?: string;
  };
  readonly PreCompact: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "PreCompact";
    readonly trigger?: string;
  };
  readonly PostCompact: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "PostCompact";
    readonly trigger?: string;
  };
  readonly Notification: {
    readonly session_id: string;
    readonly session_title?: string;
    readonly client_type?: string;
    readonly cwd: string;
    readonly hook_event_name: "Notification";
    readonly notification_type?: string;
    readonly title?: string;
    readonly body?: string;
  };
}
```
