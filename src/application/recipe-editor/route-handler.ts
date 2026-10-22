import { ConfigurationError } from "../../domain/configuration-diagnostic.ts";
import { OutpostError } from "../../domain/errors.ts";
import type {
  EditorRequest,
  EditorResponse,
  EditorRoute,
} from "../../infrastructure/editor-server.types.ts";

const faultStatus: Readonly<Partial<Record<string, number>>> = {
  conflict: 409,
  configuration: 400,
};

/** Maps expected editor failures to client errors; anything else stays a server error. */
export function recipeEditorFailure(error: unknown): EditorResponse {
  if (error instanceof ConfigurationError)
    return {
      status: 422,
      json: { error: { message: error.message, diagnostic: error.diagnostic } },
    };
  if (error instanceof OutpostError && faultStatus[error.code])
    return {
      status: faultStatus[error.code]!,
      json: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  throw error;
}

export function recipeEditorRoute(
  run: (request: EditorRequest) => Promise<unknown>,
): EditorRoute {
  return async (request) => {
    try {
      return { json: await run(request) };
    } catch (error) {
      return recipeEditorFailure(error);
    }
  };
}
