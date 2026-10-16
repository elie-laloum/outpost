import type { NativeHook, NativeHookOptions } from "../native-hooks.types.ts";

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

export type KimiHookPhase = keyof KimiHookEvents;
export type KimiHook<Phase extends KimiHookPhase = KimiHookPhase> = NativeHook<
  "kimi",
  Phase
>;
export type KimiHookOptions<Phase extends KimiHookPhase> = NativeHookOptions<
  Phase,
  KimiHookEvents[Phase],
  KimiHookDecisions[Phase]
>;
