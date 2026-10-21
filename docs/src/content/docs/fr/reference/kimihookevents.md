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

## Paramètres et propriétés

| Nom                  | Type                                                                                                                                                                                                                                                                                    | Présence | Rôle                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserPromptSubmit`   | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "UserPromptSubmit"; readonly prompt: string; }`                                                                                         | Requis   | Contenu natif de UserPromptSubmit fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.   |
| `UserPromptQueued`   | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "UserPromptQueued"; readonly prompt_id?: string; readonly prompt: string; readonly queue_length?: number; }`                            | Requis   | Contenu natif de UserPromptQueued fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.   |
| `PreToolUse`         | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PreToolUse"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_call_id?: string; }`   | Requis   | Contenu natif de PreToolUse fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `Stop`               | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "Stop"; readonly stop_hook_active?: boolean; }`                                                                                         | Requis   | Contenu natif de Stop fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.               |
| `TurnStarted`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "TurnStarted"; readonly turn_id?: string; readonly origin_kind?: string; readonly origin_name?: string; readonly prompt: string; }`     | Requis   | Contenu natif de TurnStarted fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `PostToolUse`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PostToolUse"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly tool_output?: unknown; }`  | Requis   | Contenu natif de PostToolUse fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `PostToolUseFailure` | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PostToolUseFailure"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly error?: string; }`  | Requis   | Contenu natif de PostToolUseFailure fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution. |
| `PermissionRequest`  | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PermissionRequest"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; }`                            | Requis   | Contenu natif de PermissionRequest fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.  |
| `PermissionResult`   | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PermissionResult"; readonly tool_name: string; readonly tool_input?: Readonly<Record<string, unknown>>; readonly decision?: string; }` | Requis   | Contenu natif de PermissionResult fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.   |
| `SessionStart`       | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SessionStart"; readonly source?: string; readonly model?: string; readonly profile?: string; }`                                        | Requis   | Contenu natif de SessionStart fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.       |
| `SessionEnd`         | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SessionEnd"; readonly reason?: string; }`                                                                                              | Requis   | Contenu natif de SessionEnd fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `SessionHeartbeat`   | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SessionHeartbeat"; readonly uptime_ms?: number; }`                                                                                     | Requis   | Contenu natif de SessionHeartbeat fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.   |
| `SubagentStart`      | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SubagentStart"; readonly agent_name?: string; readonly prompt: string; }`                                                              | Requis   | Contenu natif de SubagentStart fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.      |
| `SubagentStop`       | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "SubagentStop"; readonly agent_name?: string; readonly response?: string; }`                                                            | Requis   | Contenu natif de SubagentStop fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.       |
| `TaskStarted`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "TaskStarted"; readonly task_id?: string; readonly description?: string; readonly detached?: boolean; }`                                | Requis   | Contenu natif de TaskStarted fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `StopFailure`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "StopFailure"; readonly error_type?: string; readonly error_message?: string; }`                                                        | Requis   | Contenu natif de StopFailure fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `Interrupt`          | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "Interrupt"; readonly reason?: string; }`                                                                                               | Requis   | Contenu natif de Interrupt fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.          |
| `PreCompact`         | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PreCompact"; readonly trigger?: string; }`                                                                                             | Requis   | Contenu natif de PreCompact fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.         |
| `PostCompact`        | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "PostCompact"; readonly trigger?: string; }`                                                                                            | Requis   | Contenu natif de PostCompact fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.        |
| `Notification`       | `{ readonly session_id: string; readonly session_title?: string; readonly client_type?: string; readonly cwd: string; readonly hook_event_name: "Notification"; readonly notification_type?: string; readonly title?: string; readonly body?: string; }`                                | Requis   | Contenu natif de Notification fourni par Kimi, avec ses noms de champs d’origine. Les champs natifs supplémentaires sont tolérés à l’exécution.       |

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
