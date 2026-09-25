import type { ModelProtocol } from "./openai-model-provider.types.ts";
import { readChatCompletion, readModelResponse } from "./openai-response.ts";

export const modelProtocols: Readonly<Record<string, ModelProtocol>> = {
  "chat-completions": {
    path: "chat/completions",
    build: (model, request) => ({
      model,
      messages: [
        ...(request.system === undefined
          ? []
          : [{ role: "system", content: request.system }]),
        { role: "user", content: request.prompt },
      ],
      stream: false,
      store: false,
      ...(request.maxOutputTokens === undefined
        ? {}
        : { max_completion_tokens: request.maxOutputTokens }),
      ...(request.reasoning === undefined
        ? {}
        : { reasoning_effort: request.reasoning }),
    }),
    read: readChatCompletion,
  },
  responses: {
    path: "responses",
    build: (model, request) => ({
      model,
      input: request.prompt,
      ...(request.system === undefined ? {} : { instructions: request.system }),
      stream: false,
      store: false,
      ...(request.maxOutputTokens === undefined
        ? {}
        : { max_output_tokens: request.maxOutputTokens }),
      ...(request.reasoning === undefined
        ? {}
        : { reasoning: { effort: request.reasoning } }),
    }),
    read: readModelResponse,
  },
};
