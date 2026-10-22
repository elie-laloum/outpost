import { OutpostError } from "../../domain/errors.ts";
import { createJsonDecoder } from "../../infrastructure/json-schema.ts";
import { recipeEditorRoute } from "./route-handler.ts";
import { recipeEditorRequestSchemas } from "./routes.constants.ts";
import type { EditorRoute } from "../../infrastructure/editor-server.types.ts";
import type {
  RecipeEditorRunIdRequest,
  RecipeEditorRoutesOptions,
} from "./routes.types.ts";
import type { RecipeEditorRunRequest, RecipeEditorRuns } from "./runs.types.ts";

const decoders = {
  run: createJsonDecoder<RecipeEditorRunRequest>(
    recipeEditorRequestSchemas.run,
    "request",
  ),
  id: createJsonDecoder<RecipeEditorRunIdRequest>(
    recipeEditorRequestSchemas.runId,
    "request",
  ),
};

/** Run history, live execution and durable interventions from the editor. */
export function recipeEditorRunRoutes(
  options: RecipeEditorRoutesOptions,
): Readonly<Record<string, EditorRoute>> {
  const runs = (): RecipeEditorRuns => {
    if (!options.runs)
      throw new OutpostError("configuration", "Runs are unavailable");
    return options.runs;
  };
  return {
    "GET /api/runs": recipeEditorRoute(async () => ({
      runs: await runs().list(),
    })),
    "GET /api/runs/detail": recipeEditorRoute(({ query }) =>
      runs().detail(query.get("id") ?? ""),
    ),
    "POST /api/runs": recipeEditorRoute(({ body }) =>
      runs().start(decoders.run.parse(body)),
    ),
    "POST /api/runs/cancel": recipeEditorRoute(async ({ body }) =>
      runs().cancel(decoders.id.parse(body).id),
    ),
    "POST /api/runs/status": recipeEditorRoute(async ({ body, signal }) => ({
      status: await runs().status(decoders.id.parse(body).id, signal),
    })),
  };
}
