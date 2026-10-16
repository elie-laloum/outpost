import type { NativeHookSchema } from "../native-hooks.types.ts";
import type { ClaudeHookPhase } from "./claude-hooks.types.ts";

export const claudeHookSchemas: Readonly<
  Record<ClaudeHookPhase, NativeHookSchema>
> = {
  SessionStart: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SessionStart"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        source: {
          type: "string",
        },
        model: {
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
            initialUserMessage: {
              type: "string",
            },
            sessionTitle: {
              type: "string",
            },
            watchPaths: {
              type: "array",
              items: {
                type: "string",
              },
            },
            reloadSkills: {
              type: "boolean",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
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
  Setup: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Setup"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        trigger: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
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
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["UserPromptSubmit"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
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
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
    text: true,
  },
  UserPromptExpansion: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["UserPromptExpansion"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        prompt: {
          type: "string",
        },
        expansion_type: {
          type: "string",
        },
        command_name: {
          type: "string",
        },
        command_args: {
          type: "string",
        },
        command_source: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "prompt"],
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
              enum: ["UserPromptExpansion"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PreToolUse: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PreToolUse"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["PreToolUse"],
            },
            permissionDecision: {
              type: "string",
              enum: ["allow", "deny", "ask", "defer"],
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
        },
        terminalSequence: {
          type: "string",
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
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PermissionRequest"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
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
                updatedInput: {
                  type: "object",
                },
                updatedPermissions: {
                  type: "array",
                },
                message: {
                  type: "string",
                },
                interrupt: {
                  type: "boolean",
                },
              },
              required: ["behavior"],
              additionalProperties: false,
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PermissionDenied: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PermissionDenied"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
        tool_use_id: {
          type: "string",
        },
        reason: {
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["PermissionDenied"],
            },
            retry: {
              type: "boolean",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
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
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostToolUse"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
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
            classifierContext: {
              type: "string",
            },
            updatedToolOutput: {},
            updatedMCPToolOutput: {},
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PostToolUseFailure: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostToolUseFailure"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
        tool_use_id: {
          type: "string",
        },
        error: {
          type: "string",
        },
        is_interrupt: {
          type: "boolean",
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["PostToolUseFailure"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PostToolBatch: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostToolBatch"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        tool_calls: {
          type: "array",
          items: {
            type: "object",
            properties: {
              tool_name: {
                type: "string",
              },
              tool_input: {
                type: "object",
              },
              tool_use_id: {
                type: "string",
              },
              tool_response: {},
            },
            required: [],
            additionalProperties: true,
          },
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
              enum: ["PostToolBatch"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  Notification: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Notification"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        message: {
          type: "string",
        },
        title: {
          type: "string",
        },
        notification_type: {
          type: "string",
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["Notification"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  MessageDisplay: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["MessageDisplay"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        delta: {
          type: "string",
        },
        turn_id: {
          type: "string",
        },
        message_id: {
          type: "string",
        },
        index: {
          type: "number",
        },
        final: {
          type: "boolean",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "delta"],
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["MessageDisplay"],
            },
            displayContent: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
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
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SubagentStart"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
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
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  SubagentStop: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SubagentStop"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        agent_transcript_path: {
          type: "string",
        },
        last_assistant_message: {
          type: "string",
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
              enum: ["SubagentStop"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  TaskCreated: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["TaskCreated"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        task_id: {
          type: "string",
        },
        task_subject: {
          type: "string",
        },
        task_description: {
          type: "string",
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
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
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
  TaskCompleted: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["TaskCompleted"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        task_id: {
          type: "string",
        },
        task_subject: {
          type: "string",
        },
        task_description: {
          type: "string",
        },
        teammate_name: {
          type: "string",
        },
        team_name: {
          type: "string",
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
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Stop"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        stop_hook_active: {
          type: "boolean",
        },
        last_assistant_message: {
          type: "string",
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
              enum: ["Stop"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  StopFailure: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["StopFailure"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        error: {
          type: "string",
        },
        error_details: {
          type: "string",
        },
        last_assistant_message: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  TeammateIdle: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["TeammateIdle"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        teammate_name: {
          type: "string",
        },
        team_name: {
          type: "string",
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
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  InstructionsLoaded: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["InstructionsLoaded"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        file_path: {
          type: "string",
        },
        memory_type: {
          type: "string",
        },
        load_reason: {
          type: "string",
        },
        globs: {
          type: "array",
          items: {
            type: "string",
          },
        },
        trigger_file_path: {
          type: "string",
        },
        parent_file_path: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  ConfigChange: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["ConfigChange"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        source: {
          type: "string",
        },
        file_path: {
          type: "string",
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
        decision: {
          type: "string",
          enum: ["block"],
        },
        reason: {
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
  CwdChanged: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["CwdChanged"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        old_cwd: {
          type: "string",
        },
        new_cwd: {
          type: "string",
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["CwdChanged"],
            },
            watchPaths: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  DirectoryAdded: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["DirectoryAdded"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        directory: {
          type: "string",
        },
        source: {
          type: "string",
          enum: ["slash_command", "register_repo_root"],
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
  FileChanged: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["FileChanged"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        file_path: {
          type: "string",
        },
        event: {
          type: "string",
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["FileChanged"],
            },
            watchPaths: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  WorktreeCreate: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["WorktreeCreate"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        name: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
    text: true,
  },
  WorktreeRemove: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["WorktreeRemove"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        worktree_path: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        terminalSequence: {
          type: "string",
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
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PreCompact"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        trigger: {
          type: "string",
        },
        custom_instructions: {
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
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostCompact"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        trigger: {
          type: "string",
        },
        compact_summary: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PreModelSwitch: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PreModelSwitch"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        from_model: {
          type: "string",
        },
        to_model: {
          type: "string",
        },
        requested_model: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        source: {
          type: "string",
        },
        context_tokens: {
          type: "number",
        },
        prompt_cache_warm: {
          type: "boolean",
        },
        cache_ttl: {
          type: "string",
        },
        estimated_cache_write_usd: {
          type: "number",
        },
        pricing: {
          type: "string",
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
              enum: ["PreModelSwitch"],
            },
            permissionDecision: {
              type: "string",
              enum: ["allow", "deny", "ask"],
            },
            permissionDecisionReason: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PostModelSwitch: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostModelSwitch"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        from_model: {
          type: "string",
        },
        to_model: {
          type: "string",
        },
        requested_model: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        source: {
          type: "string",
        },
        context_tokens: {
          type: "number",
        },
        prompt_cache_warm: {
          type: "boolean",
        },
        cache_ttl: {
          type: "string",
        },
        estimated_cache_write_usd: {
          type: "number",
        },
        pricing: {
          type: "string",
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["PostModelSwitch"],
            },
            additionalContext: {
              type: "string",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
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
  Elicitation: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Elicitation"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        mcp_server_name: {
          type: "string",
        },
        message: {
          type: "string",
        },
        mode: {
          type: "string",
        },
        requested_schema: {
          type: "object",
        },
        elicitation_id: {
          type: "string",
        },
        url: {
          type: "string",
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["Elicitation"],
            },
            action: {
              type: "string",
              enum: ["accept", "decline", "cancel"],
            },
            content: {
              type: "object",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        decision: {
          type: "string",
          enum: ["block"],
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  ElicitationResult: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["ElicitationResult"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        mcp_server_name: {
          type: "string",
        },
        action: {
          type: "string",
        },
        content: {
          type: "object",
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            hookEventName: {
              type: "string",
              enum: ["ElicitationResult"],
            },
            action: {
              type: "string",
              enum: ["accept", "decline", "cancel"],
            },
            content: {
              type: "object",
            },
          },
          required: ["hookEventName"],
          additionalProperties: false,
        },
        decision: {
          type: "string",
          enum: ["block"],
        },
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  SessionEnd: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        transcript_path: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SessionEnd"],
        },
        permission_mode: {
          type: "string",
        },
        prompt_id: {
          type: "string",
        },
        scratchpad_dir: {
          type: "string",
        },
        agent_id: {
          type: "string",
        },
        agent_type: {
          type: "string",
        },
        effort: {
          type: "object",
          properties: {
            level: {
              type: "string",
            },
          },
          required: ["level"],
          additionalProperties: false,
        },
        reason: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        terminalSequence: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
};
