import { createAgent as composeAgent } from "../domain/agent.ts";
import { invariant } from "../domain/errors.ts";
import { builtInAgent, builtInAgentList } from "../adapters/agents/catalog.ts";
import {
  authenticationChoice,
  authenticationSetting,
} from "./init-authentication.ts";
import { supportedProviders } from "./scaffold.constants.ts";
import type { InitOptions } from "./scaffold.types.ts";

export function validateInitialization(options: InitOptions): void {
  const agent = options.agent ?? "codex",
    sandboxProvider = options.sandboxProvider ?? "docker";
  const descriptor = builtInAgent(agent);
  invariant(descriptor, `Choose ${builtInAgentList()}`);
  invariant(
    supportedProviders.includes(sandboxProvider),
    "Unknown sandbox provider",
  );
  invariant(
    !options.apiKeyEnvironment || options.baseUrl,
    "--api-key-env requires --base-url",
  );
  invariant(
    !options.baseUrl ||
      (descriptor.customModelProvider === true &&
        authenticationChoice(options).value === "usage"),
    "Custom Responses providers require Codex and usage authentication",
  );
  const authentication = authenticationSetting(options);
  const modelProvider = options.baseUrl
    ? {
        modelProvider: {
          baseUrl: options.baseUrl,
          ...(options.apiKeyEnvironment
            ? { apiKeyEnvironment: options.apiKeyEnvironment }
            : {}),
        },
      }
    : {};
  composeAgent({
    harness: descriptor.harness({ authentication, ...modelProvider }),
    ...(options.model ? { model: options.model } : {}),
  });
}
