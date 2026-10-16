import type { NativeHook, NativeHookOptions } from "../native-hooks.types.ts";

export interface CodexHookEvents {
  readonly SessionStart: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "SessionStart";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly source?: string;
    readonly agent_type?: string;
    readonly session_title?: string;
  };
  readonly SessionEnd: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "SessionEnd";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly reason?: string;
  };
  readonly UserPromptSubmit: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "UserPromptSubmit";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly prompt: string;
    readonly session_title?: string;
  };
  readonly PreToolUse: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PreToolUse";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly tool_name: string;
    readonly tool_input?: unknown;
    readonly tool_use_id?: string;
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PermissionRequest: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PermissionRequest";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly tool_name: string;
    readonly tool_input?: unknown;
    readonly tool_use_id?: string;
    readonly permission_suggestions?: readonly unknown[];
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PostToolUse: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PostToolUse";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly tool_name: string;
    readonly tool_input?: unknown;
    readonly tool_use_id?: string;
    readonly tool_response?: unknown;
    readonly mcp_server?: Readonly<Record<string, unknown>>;
  };
  readonly PreCompact: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PreCompact";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly trigger?: "manual" | "auto";
  };
  readonly PostCompact: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "PostCompact";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly trigger?: "manual" | "auto";
  };
  readonly SubagentStart: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "SubagentStart";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
  };
  readonly SubagentStop: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "SubagentStop";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly agent_id?: string;
    readonly agent_type?: string;
    readonly agent_transcript_path?: string | null;
    readonly last_assistant_message?: string | null;
    readonly stop_hook_active?: boolean;
  };
  readonly Stop: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "Stop";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
    readonly stop_hook_active?: boolean;
    readonly last_assistant_message?: string | null;
  };
  readonly Interrupt: {
    readonly session_id: string;
    readonly transcript_path?: string | null;
    readonly cwd: string;
    readonly hook_event_name: "Interrupt";
    readonly model?: string;
    readonly turn_id?: string;
    readonly permission_mode?: string;
  };
}

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
  readonly Interrupt: { readonly systemMessage?: string };
}

export type CodexHookPhase = keyof CodexHookEvents;
export type CodexHook<Phase extends CodexHookPhase = CodexHookPhase> =
  NativeHook<"codex", Phase>;
export type CodexHookOptions<Phase extends CodexHookPhase> = NativeHookOptions<
  Phase,
  CodexHookEvents[Phase],
  CodexHookDecisions[Phase]
>;
