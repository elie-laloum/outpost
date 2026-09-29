// Settings shared by all demos: the model comes from the .env file at the root.

import { fileURLToPath } from "node:url";
import {
  createOpenAIModelProvider,
  type AgentModel,
  type ModelReasoning,
} from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

process.loadEnvFile(fileURLToPath(new URL("../../.env", import.meta.url)));

// The model service (OpenAI-compatible) that answers the custom harness.
export const modelProvider = createOpenAIModelProvider({
  baseUrl: process.env.OPENAPI_URL!,
  apiKey: process.env.OPENAPI_KEY!,
});

// The model chosen by the agent.
export const model: AgentModel = {
  name: process.env.OPENAPI_MODEL!,
  reasoning: process.env.OPENAPI_REASONING as ModelReasoning,
};

// The environment where the agent runs its tools: a Docker container.
export const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:sandbox",
});
