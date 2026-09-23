import { invariant } from "../domain/errors.ts";
import {
  supportedAgents,
  supportedProviders,
  supportedTemplates,
  supportedTrackers,
} from "./scaffold.constants.ts";
import type { InitOptions } from "./scaffold.types.ts";

export function validateInitialization(options: InitOptions): void {
  const agent = options.agent ?? "codex",
    provider = options.provider ?? "docker",
    template = options.template ?? "blank";
  invariant(supportedAgents.includes(agent), "Choose codex or claude");
  invariant(supportedProviders.includes(provider), "Unknown sandbox provider");
  invariant(supportedTemplates.includes(template), "Unknown starter template");
  if (options.tracker)
    invariant(supportedTrackers.includes(options.tracker), "Unknown tracker");
}
