import {
  decisionObject,
  requireDecisionResponse,
} from "../../domain/decision-result.ts";
import { checkpointValue } from "../../domain/workflow/checkpoint-value.ts";
import { OutpostError } from "../../domain/errors.ts";
import type { DecisionProviderResult } from "../../domain/decision.types.ts";

export function readSystemOneResponse(value: unknown): DecisionProviderResult {
  const data = decisionObject(value);
  requireDecisionResponse(typeof data.model === "string");
  const answers = decisionObject(data.answers);
  const usage =
    data.usage === undefined ? undefined : decisionObject(data.usage);
  if (usage)
    requireDecisionResponse(
      [usage.input_tokens, usage.output_tokens].every(
        (value) =>
          typeof value === "number" &&
          Number.isSafeInteger(value) &&
          value >= 0,
      ),
    );
  requireDecisionResponse(
    data.truncated === undefined || typeof data.truncated === "boolean",
  );
  requireDecisionResponse(
    usage?.truncated === undefined || typeof usage.truncated === "boolean",
  );
  requireDecisionResponse(
    data.truncated === undefined ||
      usage?.truncated === undefined ||
      data.truncated === usage.truncated,
  );
  const truncated = usage?.truncated ?? data.truncated;
  requireDecisionResponse(
    truncated === undefined || typeof truncated === "boolean",
  );
  const metadata = (() => {
    try {
      return checkpointValue(value);
    } catch {
      throw new OutpostError(
        "response",
        "Decision response must contain lossless JSON",
      );
    }
  })();
  requireDecisionResponse(metadata.kind === "json");
  return {
    model: data.model,
    answers,
    ...(usage
      ? {
          usage: {
            input: Number(usage.input_tokens),
            cached: 0,
            output: Number(usage.output_tokens),
          },
        }
      : {}),
    ...(truncated === undefined ? {} : { truncated }),
    metadata: structuredClone(metadata.value),
  };
}
