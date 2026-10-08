import { recipeSpeculationTransport } from "./speculation-usage.ts";
import { speculate } from "../speculation.ts";
import { recipeDiagnostic } from "../recipe-report.ts";
import { recipeDispatchProjection } from "./projection.ts";
import { recipeJson } from "../../domain/recipes/expressions.ts";
import type { RecipeSpeculationSettings } from "./advanced-components.types.ts";
import type { TaskContext } from "../../domain/workflow.types.ts";
import type { SpeculativeCandidateResult } from "../speculation.types.ts";

function candidateResult(candidate: SpeculativeCandidateResult<unknown>) {
  const { result, error, ...fields } = candidate;
  return {
    ...fields,
    ...(result ? { result: recipeDispatchProjection(result) } : {}),
    ...(error ? { error: recipeDiagnostic(error) } : {}),
  };
}

export async function runRecipeSpeculation(
  options: RecipeSpeculationSettings,
  context: TaskContext,
) {
  const durability = options.durability
    ? {
        ...options.durability,
        transporter: recipeSpeculationTransport(
          options.durability.transporter,
          context,
        ),
      }
    : undefined;
  const result = await speculate({
    ...options,
    ...(durability ? { durability } : {}),
    signal: context.signal,
    ...(context.observation ? { observation: context.observation } : {}),
  });
  if (!durability) context.reportUsage(result.usage.tokens);
  const { winner, candidates, previousAttempts, error, host, ...fields } =
    result;
  const { error: hostError, ...hostFields } = host;
  return recipeJson(
    project({
      ...fields,
      ...(durability ? { runId: durability.runId } : {}),
      host: {
        ...hostFields,
        ...(hostError ? { error: recipeDiagnostic(hostError) } : {}),
      },
      candidates: candidates.map(candidateResult),
      ...(winner ? { winner: candidateResult(winner) } : {}),
      ...(previousAttempts
        ? { previousAttempts: previousAttempts.map(candidateResult) }
        : {}),
      ...(error ? { error: recipeDiagnostic(error) } : {}),
    }),
  );
}

function project(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(project);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, project(item)]),
    );
  return value;
}
