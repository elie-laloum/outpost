import type { NativeHookSchema } from "../native-hooks.types.ts";
import type { CodexHookPhase } from "./codex-hooks.types.ts";

export const codexHookSchemas: Readonly<
  Record<CodexHookPhase, NativeHookSchema>
> = {
  SessionStart: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SessionStart"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        source: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
          type: "string",
        },
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["SessionStart"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        continue: {
          type: "boolean",
        },
        stopReason: {
          type: "string",
        },
        suppressOutput: {
          type: "boolean",
        },
        systemMessage: {
          type: "string",
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
    text: true,
  },
  SessionEnd: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SessionEnd"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        reason: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  UserPromptSubmit: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["UserPromptSubmit"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        prompt: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "prompt"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
          type: "string",
        },
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["UserPromptSubmit"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        continue: {
          type: "boolean",
        },
        stopReason: {
          type: "string",
        },
        suppressOutput: {
          type: "boolean",
        },
        systemMessage: {
          type: "string",
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
    text: true,
  },
  PreToolUse: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PreToolUse"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        tool_name: {
          type: "string",
        },
        tool_input: {},
        tool_use_id: {
          type: "string",
        },
        mcp_server: {
          type: "object",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "tool_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        systemMessage: {
          type: "string",
        },
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
          type: "string",
        },
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["PreToolUse"],
            },
            permissionDecision: {
              type: "string",
              enum: ["allow", "deny"],
            },
            permissionDecisionReason: {
              type: "string",
            },
            updatedInput: {
              type: "object",
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
          allOf: [
            {
              if: {
                required: ["updatedInput"],
              },
              then: {
                properties: {
                  permissionDecision: {
                    const: "allow",
                  },
                },
                required: ["permissionDecision"],
              },
            },
          ],
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PermissionRequest: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PermissionRequest"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        tool_name: {
          type: "string",
        },
        tool_input: {},
        tool_use_id: {
          type: "string",
        },
        permission_suggestions: {
          type: "array",
        },
        mcp_server: {
          type: "object",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "tool_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        systemMessage: {
          type: "string",
        },
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["PermissionRequest"],
            },
            decision: {
              type: "object",
              properties: {
                behavior: {
                  type: "string",
                  enum: ["allow", "deny"],
                },
                message: {
                  type: "string",
                },
              },
              required: ["behavior"],
              additionalProperties: false,
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PostToolUse: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostToolUse"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        tool_name: {
          type: "string",
        },
        tool_input: {},
        tool_use_id: {
          type: "string",
        },
        tool_response: {},
        mcp_server: {
          type: "object",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "tool_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        systemMessage: {
          type: "string",
        },
        continue: {
          type: "boolean",
        },
        stopReason: {
          type: "string",
        },
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
          type: "string",
        },
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["PostToolUse"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PreCompact: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PreCompact"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        trigger: {
          type: "string",
          enum: ["manual", "auto"],
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        continue: {
          type: "boolean",
        },
        stopReason: {
          type: "string",
        },
        suppressOutput: {
          type: "boolean",
        },
        systemMessage: {
          type: "string",
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PostCompact: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostCompact"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        trigger: {
          type: "string",
          enum: ["manual", "auto"],
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        continue: {
          type: "boolean",
        },
        stopReason: {
          type: "string",
        },
        suppressOutput: {
          type: "boolean",
        },
        systemMessage: {
          type: "string",
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  SubagentStart: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SubagentStart"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
          type: "string",
        },
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["SubagentStart"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        continue: {
          type: "boolean",
        },
        stopReason: {
          type: "string",
        },
        suppressOutput: {
          type: "boolean",
        },
        systemMessage: {
          type: "string",
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
    text: true,
  },
  SubagentStop: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SubagentStop"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        agent_transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        last_assistant_message: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        stop_hook_active: {
          type: "boolean",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
          type: "string",
        },
        continue: {
          type: "boolean",
        },
        stopReason: {
          type: "string",
        },
        suppressOutput: {
          type: "boolean",
        },
        systemMessage: {
          type: "string",
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  Stop: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Stop"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
        stop_hook_active: {
          type: "boolean",
        },
        last_assistant_message: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
          type: "string",
        },
        continue: {
          type: "boolean",
        },
        stopReason: {
          type: "string",
        },
        suppressOutput: {
          type: "boolean",
        },
        systemMessage: {
          type: "string",
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  Interrupt: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Interrupt"],
        },
        model: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        permission_mode: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        systemMessage: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
};
