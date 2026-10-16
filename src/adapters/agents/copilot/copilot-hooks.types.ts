import type { NativeHook, NativeHookOptions } from "../native-hooks.types.ts";

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

export interface CopilotHookDecisions {
  readonly sessionStart: { readonly additionalContext?: string };
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
  readonly postToolUseFailure: { readonly additionalContext?: string };
  readonly permissionRequest: {
    readonly behavior?: "allow" | "deny";
    readonly message?: string;
    readonly interrupt?: boolean;
  };
  readonly agentStop: {
    readonly decision?: "block" | "allow";
    readonly reason?: string;
  };
  readonly subagentStart: { readonly additionalContext?: string };
  readonly subagentStop: {
    readonly decision?: "block" | "allow";
    readonly reason?: string;
    readonly modifiedResponse?: string;
  };
  readonly preCompact: never;
  readonly notification: { readonly additionalContext?: string };
  readonly errorOccurred: never;
}

export type CopilotHookPhase = keyof CopilotHookEvents;
export type CopilotHook<Phase extends CopilotHookPhase = CopilotHookPhase> =
  NativeHook<"copilot", Phase>;
export type CopilotHookOptions<Phase extends CopilotHookPhase> =
  NativeHookOptions<
    Phase,
    CopilotHookEvents[Phase],
    CopilotHookDecisions[Phase]
  >;
