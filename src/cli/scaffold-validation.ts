import { invariant } from "../domain/errors.ts";
import { supportedAgents, supportedProviders } from "./scaffold.constants.ts";
import type { InitOptions } from "./scaffold.types.ts";

export function validateInitialization(options: InitOptions): void {
  const agent = options.agent ?? "codex",
    provider = options.provider ?? "docker";
  invariant(supportedAgents.includes(agent), "Choose codex, claude or gemini");
  invariant(supportedProviders.includes(provider), "Unknown sandbox provider");
}
