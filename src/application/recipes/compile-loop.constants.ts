/** Trailing characters of each output stream kept in a failed check command's feedback. */
export const recipeLoopOutputCharacters = 4_000;

/** Response contract imposed on a loop's check agent. */
export const recipeLoopCheckResponse = {
  tag: "loop-check",
  jsonSchema: {
    type: "object",
    properties: {
      done: {
        type: "boolean",
        description: "true when the attempt satisfies the check.",
      },
      feedback: {
        type: "string",
        description: "What the next attempt must change; empty when done.",
      },
    },
    required: ["done", "feedback"],
    additionalProperties: false,
  },
} as const;
