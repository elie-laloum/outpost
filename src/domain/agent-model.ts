import { invariant, positive } from "./errors.ts";
import { AGENT_MODEL_FIELDS, MODEL_REASONING } from "./model.constants.ts";
import type { AgentModel, ModelReasoning, ModelSpec } from "./model.types.ts";

export function agentModel(spec: ModelSpec): AgentModel {
  const model = typeof spec === "string" ? { name: spec } : spec;
  invariant(
    model !== null && typeof model === "object",
    "Model must be a name or an object",
  );
  invariant(
    Object.keys(model).every((key) => AGENT_MODEL_FIELDS.has(key)),
    "Unsupported model field; use name, reasoning or maxOutputTokens",
  );
  invariant(
    typeof model.name === "string" && model.name.trim(),
    "Model name must be nonempty text",
  );
  invariant(
    model.reasoning === undefined || isModelReasoning(model.reasoning),
    "Unsupported model reasoning level",
  );
  if (model.maxOutputTokens !== undefined)
    positive(model.maxOutputTokens, "Model maxOutputTokens");
  return Object.freeze({
    name: model.name,
    ...(model.reasoning === undefined ? {} : { reasoning: model.reasoning }),
    ...(model.maxOutputTokens === undefined
      ? {}
      : { maxOutputTokens: model.maxOutputTokens }),
  });
}

export function isModelReasoning(value: unknown): value is ModelReasoning {
  return MODEL_REASONING.has(value as ModelReasoning);
}
