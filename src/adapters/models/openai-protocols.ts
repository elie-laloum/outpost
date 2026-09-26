import type { ModelProtocol } from "./model-protocol.types.ts";
import { chatBody, readChatCompletion } from "./openai-chat.ts";
import { chatStream } from "./openai-chat-stream.ts";
import { readModelResponse, responsesBody } from "./openai-responses.ts";
import { responsesStream } from "./openai-responses-stream.ts";

export const modelProtocols: Readonly<Record<string, ModelProtocol>> = {
  "chat-completions": {
    path: "chat/completions",
    build: chatBody,
    read: readChatCompletion,
    stream: {
      body: { stream: true, stream_options: { include_usage: true } },
      decoder: chatStream,
    },
  },
  responses: {
    path: "responses",
    build: responsesBody,
    read: readModelResponse,
    stream: { body: { stream: true }, decoder: responsesStream },
  },
};
