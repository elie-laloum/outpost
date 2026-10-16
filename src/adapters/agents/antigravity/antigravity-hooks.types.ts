import type { NativeHook, NativeHookOptions } from "../native-hooks.types.ts";

export interface AntigravityHookEvents {
  readonly SessionStart: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
  };
  readonly PreToolUse: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly toolCall?: {
      readonly name: string;
      readonly args: Readonly<Record<string, unknown>>;
    };
    readonly stepIdx?: number;
  };
  readonly PostToolUse: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly toolCall?: {
      readonly name: string;
      readonly args: Readonly<Record<string, unknown>>;
    };
    readonly stepIdx?: number;
    readonly error?: string;
  };
  readonly PreInvocation: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly invocationNum?: number;
    readonly initialNumSteps?: number;
  };
  readonly PostInvocation: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly invocationNum?: number;
    readonly initialNumSteps?: number;
  };
  readonly Stop: {
    readonly conversationId: string;
    readonly workspacePaths: readonly string[];
    readonly transcriptPath?: string;
    readonly artifactDirectoryPath?: string;
    readonly modelName?: string;
    readonly executionNum?: number;
    readonly terminationReason?: string;
    readonly error?: string;
    readonly fullyIdle?: boolean;
  };
}

export interface AntigravityHookDecisions {
  readonly SessionStart: {
    readonly injectSteps?: readonly {
      readonly systemMessage?: {
        readonly systemMessage?: string;
        readonly metadata?: Readonly<Record<string, unknown>>;
      };
      readonly userMessage?: string;
      readonly ephemeralMessage?: string;
      readonly toolCall?: Readonly<Record<string, unknown>>;
    }[];
  };
  readonly PreToolUse: {
    readonly decision:
      | "allow"
      | "auto_approve"
      | "deny"
      | "ask"
      | "force_ask"
      | "deny_unless_prior_grant";
    readonly reason?: string;
    readonly overwrite?: Readonly<Record<string, unknown>>;
    readonly permissionOverrides?: readonly string[];
  };
  readonly PostToolUse: {};
  readonly PreInvocation: {
    readonly injectSteps?: readonly {
      readonly systemMessage?: {
        readonly systemMessage?: string;
        readonly metadata?: Readonly<Record<string, unknown>>;
      };
      readonly userMessage?: string;
      readonly ephemeralMessage?: string;
      readonly toolCall?: Readonly<Record<string, unknown>>;
    }[];
  };
  readonly PostInvocation: {
    readonly injectSteps?: readonly {
      readonly systemMessage?: {
        readonly systemMessage?: string;
        readonly metadata?: Readonly<Record<string, unknown>>;
      };
      readonly userMessage?: string;
      readonly ephemeralMessage?: string;
      readonly toolCall?: Readonly<Record<string, unknown>>;
    }[];
    readonly terminationBehavior?: "force_continue" | "terminate" | "";
  };
  readonly Stop: { readonly decision: string; readonly reason?: string };
}

export type AntigravityHookPhase = keyof AntigravityHookEvents;
export type AntigravityHook<
  Phase extends AntigravityHookPhase = AntigravityHookPhase,
> = NativeHook<"antigravity", Phase>;
export type AntigravityHookOptions<Phase extends AntigravityHookPhase> =
  NativeHookOptions<
    Phase,
    AntigravityHookEvents[Phase],
    AntigravityHookDecisions[Phase]
  >;
