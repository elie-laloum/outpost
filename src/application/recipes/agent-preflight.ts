import { dispatchCandidates } from "../../domain/fallback-agent.ts";
import { resolveVariables } from "../../infrastructure/settings.ts";
import type { DispatchAgent } from "../../domain/fallback-agent.types.ts";
import type { RecipeComponentScope } from "./components.types.ts";

export async function preflightRecipeAgent(
  agent: DispatchAgent,
  repository: string,
  variables: Readonly<Record<string, string>>,
  scope: RecipeComponentScope,
): Promise<void> {
  for (const candidate of dispatchCandidates(agent)) {
    if (candidate.kind !== "cli") continue;
    const selected = await resolveVariables(
      repository,
      candidate.variables,
      variables,
    );
    scope.protect(Object.values(selected));
    const credentials = candidate.credentials?.(selected);
    if (credentials) scope.protect(Object.values(credentials.variables));
    candidate.configuration?.({ ...selected, ...credentials?.variables });
  }
}
