import type { NativeHookSchema } from "../native-hooks.types.ts";
import type { AntigravityHookPhase } from "./antigravity-hooks.types.ts";

export const antigravityHookSchemas: Readonly<
  Record<AntigravityHookPhase, NativeHookSchema>
> = {
  SessionStart: {
    input: {
      type: "object",
      properties: {
        conversationId: {
          type: "string",
        },
        workspacePaths: {
          type: "array",
          items: {
            type: "string",
          },
        },
        transcriptPath: {
          type: "string",
        },
        artifactDirectoryPath: {
          type: "string",
        },
        modelName: {
          type: "string",
        },
      },
      required: ["conversationId", "workspacePaths"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        injectSteps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              systemMessage: {
                type: "object",
                properties: {
                  systemMessage: {
                    type: "string",
                  },
                  metadata: {
                    type: "object",
                  },
                },
                required: [],
                additionalProperties: false,
              },
              userMessage: {
                type: "string",
              },
              ephemeralMessage: {
                type: "string",
              },
              toolCall: {
                type: "object",
              },
            },
            required: [],
            additionalProperties: false,
          },
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
        conversationId: {
          type: "string",
        },
        workspacePaths: {
          type: "array",
          items: {
            type: "string",
          },
        },
        transcriptPath: {
          type: "string",
        },
        artifactDirectoryPath: {
          type: "string",
        },
        modelName: {
          type: "string",
        },
        toolCall: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            args: {
              type: "object",
            },
          },
          required: ["name", "args"],
          additionalProperties: false,
        },
        stepIdx: {
          type: "number",
        },
      },
      required: ["conversationId", "workspacePaths"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          enum: [
            "allow",
            "auto_approve",
            "deny",
            "ask",
            "force_ask",
            "deny_unless_prior_grant",
          ],
        },
        reason: {
          type: "string",
        },
        overwrite: {
          type: "object",
        },
        permissionOverrides: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      required: ["decision"],
      additionalProperties: false,
    },
  },
  PostToolUse: {
    input: {
      type: "object",
      properties: {
        conversationId: {
          type: "string",
        },
        workspacePaths: {
          type: "array",
          items: {
            type: "string",
          },
        },
        transcriptPath: {
          type: "string",
        },
        artifactDirectoryPath: {
          type: "string",
        },
        modelName: {
          type: "string",
        },
        toolCall: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            args: {
              type: "object",
            },
          },
          required: ["name", "args"],
          additionalProperties: false,
        },
        stepIdx: {
          type: "number",
        },
        error: {
          type: "string",
        },
      },
      required: ["conversationId", "workspacePaths"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  PreInvocation: {
    input: {
      type: "object",
      properties: {
        conversationId: {
          type: "string",
        },
        workspacePaths: {
          type: "array",
          items: {
            type: "string",
          },
        },
        transcriptPath: {
          type: "string",
        },
        artifactDirectoryPath: {
          type: "string",
        },
        modelName: {
          type: "string",
        },
        invocationNum: {
          type: "number",
        },
        initialNumSteps: {
          type: "number",
        },
      },
      required: ["conversationId", "workspacePaths"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        injectSteps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              systemMessage: {
                type: "object",
                properties: {
                  systemMessage: {
                    type: "string",
                  },
                  metadata: {
                    type: "object",
                  },
                },
                required: [],
                additionalProperties: false,
              },
              userMessage: {
                type: "string",
              },
              ephemeralMessage: {
                type: "string",
              },
              toolCall: {
                type: "object",
              },
            },
            required: [],
            additionalProperties: false,
          },
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  PostInvocation: {
    input: {
      type: "object",
      properties: {
        conversationId: {
          type: "string",
        },
        workspacePaths: {
          type: "array",
          items: {
            type: "string",
          },
        },
        transcriptPath: {
          type: "string",
        },
        artifactDirectoryPath: {
          type: "string",
        },
        modelName: {
          type: "string",
        },
        invocationNum: {
          type: "number",
        },
        initialNumSteps: {
          type: "number",
        },
      },
      required: ["conversationId", "workspacePaths"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        injectSteps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              systemMessage: {
                type: "object",
                properties: {
                  systemMessage: {
                    type: "string",
                  },
                  metadata: {
                    type: "object",
                  },
                },
                required: [],
                additionalProperties: false,
              },
              userMessage: {
                type: "string",
              },
              ephemeralMessage: {
                type: "string",
              },
              toolCall: {
                type: "object",
              },
            },
            required: [],
            additionalProperties: false,
          },
        },
        terminationBehavior: {
          type: "string",
          enum: ["force_continue", "terminate", ""],
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
        conversationId: {
          type: "string",
        },
        workspacePaths: {
          type: "array",
          items: {
            type: "string",
          },
        },
        transcriptPath: {
          type: "string",
        },
        artifactDirectoryPath: {
          type: "string",
        },
        modelName: {
          type: "string",
        },
        executionNum: {
          type: "number",
        },
        terminationReason: {
          type: "string",
        },
        error: {
          type: "string",
        },
        fullyIdle: {
          type: "boolean",
        },
      },
      required: ["conversationId", "workspacePaths"],
      additionalProperties: true,
    },
    output: {
      type: "object",
      properties: {
        decision: {
          type: "string",
        },
        reason: {
          type: "string",
        },
      },
      required: ["decision"],
      additionalProperties: false,
    },
  },
};
