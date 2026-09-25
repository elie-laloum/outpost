import { invariant } from "../../domain/errors.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { HARNESS_MODEL_KEYS } from "./model-support.constants.ts";
import type { CliModelSupport } from "./settings.types.ts";

export function supportModel(
  support: CliModelSupport,
  model: AgentModel | undefined,
): void {
  invariant(
    model?.reasoning === undefined || support.reasoning.has(model.reasoning),
    `${support.agent} does not support reasoning "${model?.reasoning}"`,
  );
  invariant(
    model?.maxOutputTokens === undefined || support.maxOutputTokens,
    `${support.agent} does not support maxOutputTokens`,
  );
}

export function harnessSettings(settings: object): void {
  invariant(
    settings && typeof settings === "object",
    "Harness settings must be an object",
  );
  invariant(
    HARNESS_MODEL_KEYS.every((key) => !(key in settings)),
    "Set the model, reasoning and maxOutputTokens on agent(), not on its harness",
  );
}
