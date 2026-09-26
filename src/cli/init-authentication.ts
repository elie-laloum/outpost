import type { AgentAuthentication } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import { authenticationChoices } from "./main.constants.ts";
import type { AuthenticationChoice, InitOptions } from "./scaffold.types.ts";

export function authenticationChoice(
  options: InitOptions,
): AuthenticationChoice {
  const agent = options.agent ?? "codex";
  const value =
    options.authentication ?? (options.baseUrl ? "usage" : "account");
  const choices: readonly AuthenticationChoice[] = Object.hasOwn(
    authenticationChoices,
    agent,
  )
    ? authenticationChoices[agent]
    : [];
  const choice = choices.find((candidate) => candidate.value === value);
  invariant(
    choice,
    `Authentication for ${agent} must be ${choices.map((candidate) => candidate.value).join(", ") || "one of its supported forms"}`,
  );
  return choice;
}

export function authenticationEnvironment(options: InitOptions): string {
  if (options.baseUrl)
    return `${options.apiKeyEnvironment ?? "OPENAI_API_KEY"}=\n`;
  const { variable } = authenticationChoice(options);
  return variable ? `${variable}=\n` : "";
}

export function authenticationInstructions(options: InitOptions): string {
  if (options.baseUrl)
    return `Set ${options.apiKeyEnvironment ?? "OPENAI_API_KEY"} in the workflow .env or parent environment for the custom Responses provider.`;
  return authenticationChoice(options).instructions;
}

export function authenticationSetting(
  options: InitOptions,
): AgentAuthentication {
  const { value, variable } = authenticationChoice(options);
  if (value !== "account-token") return value;
  invariant(variable, "Account tokens require a declared variable");
  return { account: { variable } };
}

export function authenticationSource(options: InitOptions): string {
  const setting = authenticationSetting(options);
  if (typeof setting === "string") return JSON.stringify(setting);
  return `{ account: { variable: ${JSON.stringify(authenticationChoice(options).variable)} } }`;
}
