import { createJsonDecoder } from "../../infrastructure/json-schema.ts";
import {
  createRecipeEditorExtension,
  readRecipeEditorModule,
  recipeEditorContracts,
  recipeEditorExtensionKinds,
  recipeEditorExtensions,
  verifyRecipeEditorExtensions,
  writeRecipeEditorModule,
} from "./extensions.ts";
import { recipeEditorRoute } from "./route-handler.ts";
import { recipeEditorRequestSchemas } from "./routes.constants.ts";
import type { EditorRoute } from "../../infrastructure/editor-server.types.ts";
import type { RecipeEditorExtensionRequest } from "./extensions.types.ts";
import type {
  RecipeEditorModuleRequest,
  RecipeEditorRoutesOptions,
} from "./routes.types.ts";

const decoders = {
  extension: createJsonDecoder<RecipeEditorExtensionRequest>(
    recipeEditorRequestSchemas.extension,
    "request",
  ),
  module: createJsonDecoder<RecipeEditorModuleRequest>(
    recipeEditorRequestSchemas.module,
    "request",
  ),
};

/** Extension declarations, their module sources and their verification. */
export function recipeEditorExtensionRoutes(
  options: RecipeEditorRoutesOptions,
): Readonly<Record<string, EditorRoute>> {
  const { session } = options;
  return {
    "GET /api/extensions": recipeEditorRoute(async () => ({
      extensions: await recipeEditorExtensions(session),
      kinds: recipeEditorExtensionKinds(),
      contracts: recipeEditorContracts(),
    })),
    "POST /api/extensions": recipeEditorRoute(({ body }) =>
      createRecipeEditorExtension(session, decoders.extension.parse(body)),
    ),
    "POST /api/extensions/verify": recipeEditorRoute(({ signal }) =>
      verifyRecipeEditorExtensions({ session, cli: options.cli ?? [], signal }),
    ),
    "GET /api/modules": recipeEditorRoute(({ query }) =>
      readRecipeEditorModule(session.root, query.get("path") ?? ""),
    ),
    "POST /api/modules": recipeEditorRoute(({ body }) => {
      const request = decoders.module.parse(body);
      return writeRecipeEditorModule(
        session.root,
        request.path,
        request.text,
        request.hash,
      );
    }),
  };
}
