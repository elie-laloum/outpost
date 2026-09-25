import { invariant } from "../../domain/errors.ts";
import type {
  AgentAdapter,
  AgentAuthentication,
} from "../../domain/agent.types.ts";
import { authenticationRecipes } from "./authentication.constants.ts";

export function authenticationCommand(
  name: "codex" | "claude" | "gemini",
  authentication: AgentAuthentication | undefined,
  externalModel = false,
): NonNullable<AgentAdapter["authenticate"]> {
  if (!authentication) return () => undefined;
  const mode = authentication.mode;
  invariant(
    mode === "api-key" ||
      (mode === "oauth-token" && name === "claude") ||
      (mode === "login" && name === "codex" && !externalModel),
    "Unsupported harness authentication mode",
  );
  if (mode === "login") {
    const credentials = authentication.credentials;
    if (credentials === undefined) return () => undefined;
    try {
      JSON.parse(credentials);
    } catch {
      throw new Error("Invalid Codex credential JSON");
    }
    return () => ({
      executable: "node",
      arguments: ["-e", authenticationRecipes.codex.seed],
      stdin: credentials,
    });
  }
  const environment =
    mode === "oauth-token"
      ? "CLAUDE_CODE_OAUTH_TOKEN"
      : (authentication.environment ??
        authenticationRecipes[name].environment.trim().replace("=", ""));
  invariant(
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(environment),
    "Invalid authentication environment variable",
  );
  invariant(
    name === "codex" ||
      mode === "oauth-token" ||
      environment ===
        authenticationRecipes[name].environment.trim().replace("=", ""),
    "This CLI requires its standard authentication environment variable",
  );
  return (variables) => {
    invariant(
      variables[environment],
      `Missing ${environment}. Declare the selected credential explicitly.`,
    );
    if (name === "claude") {
      const conflict =
        mode === "oauth-token"
          ? "ANTHROPIC_API_KEY"
          : "CLAUDE_CODE_OAUTH_TOKEN";
      invariant(
        !variables[conflict],
        "Conflicting Claude authentication methods",
      );
    }
    if (name !== "codex" || externalModel) return undefined;
    return {
      executable: "node",
      arguments: ["-e", authenticationRecipes.codex.login],
      stdin: variables[environment],
    };
  };
}
