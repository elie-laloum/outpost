export const interactiveTaskDefaults = { maxTurns: 12 } as const;

export const interactiveResponseSchema = {
  anyOf: [
    {
      type: "object",
      properties: {
        kind: { const: "question" },
        question: { type: "string", pattern: "\\S" },
        choices: {
          type: "array",
          items: { type: "string", pattern: "\\S" },
          minItems: 1,
          uniqueItems: true,
        },
        allowFreeText: { type: "boolean" },
      },
      required: ["kind", "question"],
      if: {
        properties: { allowFreeText: { const: false } },
        required: ["allowFreeText"],
      },
      then: { required: ["choices"] },
    },
    {
      type: "object",
      properties: { kind: { const: "completed" }, output: {} },
      required: ["kind", "output"],
    },
  ],
};

export const interactiveTurnInstructions = `This is a durable interactive task. End each turn with exactly one JSON response inside <interaction> and </interaction>.
When human input is needed, return {"kind":"question","question":"Your question","choices":["Optional choice"],"allowFreeText":true}. Omit choices for free text. Set allowFreeText to false only when choices are supplied and the user must choose one.
When the entire task is complete, return {"kind":"completed","output":<your JSON result>}.
Ask one focused question at a time and adapt subsequent questions to the answers in this conversation. Do not invent a human answer. Do not wait for terminal input.
The sandbox is recreated between turns. Keep required project files in the repository. Do not switch branches, integrate or push changes. The workflow will retain the workspace.`;
