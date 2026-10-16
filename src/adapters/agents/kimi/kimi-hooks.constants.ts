import type { NativeHookSchema } from "../native-hooks.types.ts";
import type { KimiHookPhase } from "./kimi-hooks.types.ts";

export const kimiHookSchemas: Readonly<
  Record<KimiHookPhase, NativeHookSchema>
> = {
  UserPromptSubmit: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["UserPromptSubmit"],
        },
        prompt: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "prompt"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        hookSpecificOutput: {
          type: "object",
          properties: {
            permissionDecision: {
              type: "string",
              enum: ["deny"],
            },
            permissionDecisionReason: {
              type: "string",
            },
          },
          required: ["permissionDecision"],
          additionalProperties: false,
        },
      },
      required: [],
      additionalProperties: false,
    },
    text: true,
  },
  UserPromptQueued: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["UserPromptQueued"],
        },
        prompt_id: {
          type: "string",
        },
        prompt: {
          type: "string",
        },
        queue_length: {
          type: "number",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "prompt"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  PreToolUse: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PreToolUse"],
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
        tool_call_id: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "tool_name"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        hookSpecificOutput: {
          type: "object",
          properties: {
            permissionDecision: {
              type: "string",
              enum: ["deny"],
            },
            permissionDecisionReason: {
              type: "string",
            },
          },
          required: ["permissionDecision"],
          additionalProperties: false,
        },
      },
      required: [],
      additionalProperties: false,
    },
    text: true,
  },
  Stop: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Stop"],
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
        hookSpecificOutput: {
          type: "object",
          properties: {
            permissionDecision: {
              type: "string",
              enum: ["deny"],
            },
            permissionDecisionReason: {
              type: "string",
            },
          },
          required: ["permissionDecision"],
          additionalProperties: false,
        },
      },
      required: [],
      additionalProperties: false,
    },
    text: true,
  },
  TurnStarted: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["TurnStarted"],
        },
        turn_id: {
          type: "string",
        },
        origin_kind: {
          type: "string",
        },
        origin_name: {
          type: "string",
        },
        prompt: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "prompt"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  PostToolUse: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostToolUse"],
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
        tool_output: {},
      },
      required: ["session_id", "cwd", "hook_event_name", "tool_name"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  PostToolUseFailure: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostToolUseFailure"],
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
        error: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "tool_name"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  PermissionRequest: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PermissionRequest"],
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "tool_name"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  PermissionResult: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PermissionResult"],
        },
        tool_name: {
          type: "string",
        },
        tool_input: {
          type: "object",
        },
        decision: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "tool_name"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  SessionStart: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SessionStart"],
        },
        source: {
          type: "string",
        },
        model: {
          type: "string",
        },
        profile: {
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
  SessionEnd: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SessionEnd"],
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
  SessionHeartbeat: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SessionHeartbeat"],
        },
        uptime_ms: {
          type: "number",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  SubagentStart: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SubagentStart"],
        },
        agent_name: {
          type: "string",
        },
        prompt: {
          type: "string",
        },
      },
      required: ["session_id", "cwd", "hook_event_name", "prompt"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  SubagentStop: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["SubagentStop"],
        },
        agent_name: {
          type: "string",
        },
        response: {
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
  TaskStarted: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["TaskStarted"],
        },
        task_id: {
          type: "string",
        },
        description: {
          type: "string",
        },
        detached: {
          type: "boolean",
        },
      },
      required: ["session_id", "cwd", "hook_event_name"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  StopFailure: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["StopFailure"],
        },
        error_type: {
          type: "string",
        },
        error_message: {
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
  Interrupt: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Interrupt"],
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
  PreCompact: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PreCompact"],
        },
        trigger: {
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
  PostCompact: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["PostCompact"],
        },
        trigger: {
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
  Notification: {
    input: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
        },
        session_title: {
          type: "string",
        },
        client_type: {
          type: "string",
        },
        cwd: {
          type: "string",
        },
        hook_event_name: {
          type: "string",
          enum: ["Notification"],
        },
        notification_type: {
          type: "string",
        },
        title: {
          type: "string",
        },
        body: {
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
};
