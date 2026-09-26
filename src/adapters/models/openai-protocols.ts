import type { ModelProtocol } from "./model-protocol.types.ts";
import { chatBody, readChatCompletion } from "./openai-chat.ts";
import { readModelResponse, responsesBody } from "./openai-responses.ts";

export const modelProtocols: Readonly<Record<string, ModelProtocol>> = {
  "chat-completions": {
    path: "chat/completions",
    build: chatBody,
    read: readChatCompletion,
  },
  responses: {
    path: "responses",
    build: responsesBody,
    read: readModelResponse,
  },
};
