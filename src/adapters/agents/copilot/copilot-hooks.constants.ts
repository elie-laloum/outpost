import type { NativeHookSchema } from "../native-hooks.types.ts";
import type { CopilotHookPhase } from "./copilot-hooks.types.ts";

export const copilotHookSchemas: Readonly<
  Record<CopilotHookPhase, NativeHookSchema>
> = {
  sessionStart: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        source: {
          type: "string",
        },
        initialPrompt: {
          type: "string",
        },
      },
      required: ["sessionId", "timestamp", "cwd"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        additionalContext: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  sessionEnd: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        reason: {
          type: "string",
        },
      },
      required: ["sessionId", "timestamp", "cwd"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  userPromptSubmitted: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        prompt: {
          type: "string",
        },
      },
      required: ["sessionId", "timestamp", "cwd", "prompt"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  userPromptTransformed: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        prompt: {
          type: "string",
        },
        transformedPrompt: {
          type: "string",
        },
      },
      required: ["sessionId", "timestamp", "cwd", "prompt"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        modifiedTransformedPrompt: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  preToolUse: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        toolName: {
          type: "string",
        },
        toolArgs: {},
      },
      required: ["sessionId", "timestamp", "cwd", "toolName"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        permissionDecision: {
          type: "string",
          enum: ["allow", "deny", "ask"],
        },
        permissionDecisionReason: {
          type: "string",
        },
        modifiedArgs: {
          type: "object",
        },
        additionalContext: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  postToolUse: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        toolName: {
          type: "string",
        },
        toolArgs: {},
        toolResult: {},
      },
      required: ["sessionId", "timestamp", "cwd", "toolName"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        modifiedResult: {
          type: "object",
          properties: {
            resultType: {
              type: "string",
              enum: ["success", "failure"],
            },
            textResultForLlm: {
              type: "string",
            },
          },
          required: ["resultType", "textResultForLlm"],
          additionalProperties: false,
        },
        additionalContext: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  postToolUseFailure: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        toolName: {
          type: "string",
        },
        toolArgs: {},
        error: {},
      },
      required: ["sessionId", "timestamp", "cwd", "toolName"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        additionalContext: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  permissionRequest: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        toolName: {
          type: "string",
        },
        toolArgs: {},
      },
      required: ["sessionId", "timestamp", "cwd", "toolName"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        behavior: {
          type: "string",
          enum: ["allow", "deny"],
        },
        message: {
          type: "string",
        },
        interrupt: {
          type: "boolean",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  agentStop: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        stop_hook_active: {
          type: "boolean",
        },
        transcriptPath: {
          type: "string",
        },
        stopReason: {
          type: "string",
          enum: ["end_turn"],
        },
      },
      required: ["sessionId", "timestamp", "cwd"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: ["block", "allow"],
        },
        reason: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  subagentStart: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        agentName: {
          type: "string",
        },
        transcriptPath: {
          type: "string",
        },
        agentDisplayName: {
          type: "string",
        },
        agentDescription: {
          type: "string",
        },
      },
      required: ["sessionId", "timestamp", "cwd"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        additionalContext: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  subagentStop: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        agentName: {
          type: "string",
        },
        agentId: {
          type: "string",
        },
        agentType: {
          type: "string",
        },
        transcriptPath: {
          type: "string",
        },
        agentDisplayName: {
          type: "string",
        },
        response: {
          type: "string",
        },
        stopReason: {
          type: "string",
          enum: ["end_turn"],
        },
      },
      required: ["sessionId", "timestamp", "cwd"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: ["block", "allow"],
        },
        reason: {
          type: "string",
        },
        modifiedResponse: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  preCompact: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        trigger: {
          type: "string",
          enum: ["manual", "auto"],
        },
        transcriptPath: {
          type: "string",
        },
        customInstructions: {
          type: "string",
        },
      },
      required: ["sessionId", "timestamp", "cwd"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
  notification: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        notification_type: {
          type: "string",
        },
        message: {
          type: "string",
        },
      },
      required: ["sessionId", "timestamp", "cwd"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        additionalContext: {
          type: "string",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  errorOccurred: {
    input: {
      type: "object",
      properties: {
        sessionId: {
          type: "string",
        },
        timestamp: {
          type: "number",
        },
        cwd: {
          type: "string",
        },
        error: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            name: {
              type: "string",
            },
            stack: {
              type: "string",
            },
          },
          required: ["message", "name"],
          additionalProperties: false,
        },
        errorContext: {
          type: "string",
          enum: ["model_call", "tool_execution", "system", "user_input"],
        },
        recoverable: {
          type: "boolean",
        },
      },
      required: ["sessionId", "timestamp", "cwd"],
      additionalProperties: true,
    },
    output: {
      not: {},
    },
  },
};
