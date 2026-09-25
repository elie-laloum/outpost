import { invariant, positive } from "../../domain/errors.ts";
import type { ModelRequest } from "../../domain/model.types.ts";
import type { ModelProtocol } from "./openai-compatible.types.ts";
import { MODEL_REQUEST_FIELDS } from "./openai-compatible.constants.ts";
import { readChatCompletion, readModelResponse } from "./openai-response.ts";

export function validateModelRequest(request: ModelRequest): void {
  invariant(
    request !== null && typeof request === "object",
    "Model request must be an object",
  );
  invariant(
    Object.keys(request).every((key) => MODEL_REQUEST_FIELDS.has(key)),
    "Unsupported model request field; tools, streaming and conversations are not implemented",
  );
  invariant(
    typeof request.prompt === "string" && request.prompt.trim(),
    "Model prompt must be nonempty text",
  );
  invariant(
    request.system === undefined || typeof request.system === "string",
    "Model system instructions must be text",
  );
  if (request.maxOutputTokens !== undefined)
    positive(request.maxOutputTokens, "Model maxOutputTokens");
}

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
    }),
    read: readModelResponse,
  },
};
