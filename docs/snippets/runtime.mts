import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import {
  agent as composeAgent,
  antigravityHarness,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
  type AgentAuthentication,
  type LifecycleHooks,
} from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const settings = parseEnv(
  await readFile(new URL(".env", import.meta.url), "utf8"),
);
export const repository = resolve(import.meta.dirname, "../repository");
export const variables = Object.fromEntries(
  Object.entries(settings)
    .filter(([name]) => !name.startsWith("OUTPOST_"))
    .map(([name, value]) => [name, value || process.env[name] || ""]),
);

const factories = {
  codex: codexHarness,
  claude: claudeHarness,
  antigravity: antigravityHarness,
  copilot: copilotHarness,
  kimi: kimiHarness,
};
const tokens: Record<string, string> = {
  claude: "CLAUDE_CODE_OAUTH_TOKEN",
  copilot: "COPILOT_GITHUB_TOKEN",
};

function authenticationFor(name: string, choice: string): AgentAuthentication {
  if (choice === "account-token" && tokens[name])
    return { account: { variable: tokens[name] } };
  if (choice === "account" || choice === "usage") return choice;
  throw new Error(`Unsupported OUTPOST_AUTH for ${name}: ${choice}`);
}

export async function configuration(
  name = settings.OUTPOST_AGENT ?? "codex",
  authentication = settings.OUTPOST_AUTH ?? "account",
) {
  if (!Object.hasOwn(factories, name))
    throw new Error(`Choose ${Object.keys(factories).join(", ")}`);
  return {
    repository,
    agent: composeAgent({
      harness: factories[name as keyof typeof factories]({
        authentication: authenticationFor(name, authentication),
      }),
      ...(settings.OUTPOST_MODEL ? { model: settings.OUTPOST_MODEL } : {}),
    }),
    sandboxProvider: dockerSandboxProvider({
      image: "outpost:docs-demo",
      variables,
    }),
    hooks: {} as LifecycleHooks,
  };
}
