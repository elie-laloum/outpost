import { createAgent as composeAgent } from "../domain/agent.ts";
import { invariant } from "../domain/errors.ts";
import {
  createAntigravityHarness,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
} from "../providers/agents.ts";
import {
  authenticationChoice,
  authenticationSetting,
} from "./init-authentication.ts";
import { authenticationChoices } from "./main.constants.ts";
import { supportedProviders } from "./scaffold.constants.ts";
import type { InitOptions } from "./scaffold.types.ts";

const harnesses = {
  codex: createCodexHarness,
  claude: createClaudeHarness,
  antigravity: createAntigravityHarness,
  copilot: createCopilotHarness,
  kimi: createKimiHarness,
} as const;

export function validateInitialization(options: InitOptions): void {
  const agent = options.agent ?? "codex",
    sandboxProvider = options.sandboxProvider ?? "docker";
  invariant(
    Object.hasOwn(authenticationChoices, agent),
    "Choose codex, claude, antigravity, copilot or kimi",
  );
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
      (agent === "codex" && authenticationChoice(options).value === "usage"),
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
    harness: harnesses[agent]({ authentication, ...modelProvider }),
    ...(options.model ? { model: options.model } : {}),
  });
}
