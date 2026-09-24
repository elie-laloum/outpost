import { codex } from "../adapters/agents/codex-adapter.ts";
import { invariant } from "../domain/errors.ts";
import { supportedAgents, supportedProviders } from "./scaffold.constants.ts";
import type { InitOptions } from "./scaffold.types.ts";

export function validateInitialization(options: InitOptions): void {
  const agent = options.agent ?? "codex",
    provider = options.provider ?? "docker";
  invariant(supportedAgents.includes(agent), "Choose codex, claude or gemini");
  invariant(supportedProviders.includes(provider), "Unknown sandbox provider");
  invariant(
    !options.apiKeyEnvironment || options.baseUrl,
    "--api-key-env requires --base-url",
  );
  if (options.baseUrl) {
    invariant(
      agent === "codex" &&
        (!options.authentication || options.authentication === "api-key"),
      "Custom Responses providers require Codex and api-key authentication",
    );
    codex({
      ...(options.model ? { model: options.model } : {}),
      modelProvider: {
        baseUrl: options.baseUrl,
        ...(options.apiKeyEnvironment
          ? { apiKeyEnvironment: options.apiKeyEnvironment }
          : {}),
      },
    });
  }
  const authentication = options.authentication ?? "api-key";
  invariant(
    authentication === "api-key" ||
      (authentication === "oauth-token" && agent === "claude") ||
      (authentication === "login" && agent === "codex"),
    "Authentication must be api-key, oauth-token for Claude, or login for Codex",
  );
}
