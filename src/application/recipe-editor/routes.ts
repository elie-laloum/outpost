import { readFile } from "node:fs/promises";
import { ConfigurationError } from "../../domain/configuration-diagnostic.ts";
import { OutpostError } from "../../domain/errors.ts";
import { recipeEditorLayout } from "../../domain/recipes/editor.ts";
import { listEditorDirectory } from "../../infrastructure/editor-files.ts";
import { createJsonDecoder } from "../../infrastructure/json-schema.ts";
import {
  recipeEditorRequestSchemas,
  recipeEditorServerDefaults,
} from "./routes.constants.ts";
import { recipeEditorStarters } from "./starters.constants.ts";
import type {
  EditorRequest,
  EditorResponse,
  EditorRoute,
} from "../../infrastructure/editor-server.types.ts";
import type { RecipeEditorOpenOptions } from "./session.types.ts";
import type {
  RecipeEditorEditRequest,
  RecipeEditorLayoutRequest,
  RecipeEditorRevisionRequest,
  RecipeEditorRoutesOptions,
  RecipeEditorSaveRequest,
  RecipeEditorSessionInfo,
  RecipeEditorTextRequest,
} from "./routes.types.ts";

const decoders = {
  open: createJsonDecoder<RecipeEditorOpenOptions>(
    recipeEditorRequestSchemas.open,
    "request",
  ),
  edit: createJsonDecoder<RecipeEditorEditRequest>(
    recipeEditorRequestSchemas.edit,
    "request",
  ),
  text: createJsonDecoder<RecipeEditorTextRequest>(
    recipeEditorRequestSchemas.text,
    "request",
  ),
  layout: createJsonDecoder<RecipeEditorLayoutRequest>(
    recipeEditorRequestSchemas.layout,
    "request",
  ),
  revision: createJsonDecoder<RecipeEditorRevisionRequest>(
    recipeEditorRequestSchemas.revision,
    "request",
  ),
  save: createJsonDecoder<RecipeEditorSaveRequest>(
    recipeEditorRequestSchemas.save,
    "request",
  ),
};

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

function aborted(signal: AbortSignal): Promise<void> {
  return new Promise((done) => {
    if (signal.aborted) return done();
    signal.addEventListener("abort", () => done(), { once: true });
  });
}

/** API routes for the recipe drafts, files and schemas of one editor session. */
export function recipeEditorRoutes(
  options: RecipeEditorRoutesOptions,
): Readonly<Record<string, EditorRoute>> {
  const { session } = options;
  const schemas = new Map<string, Promise<unknown>>();
  let watchers = 0;
  let poller: NodeJS.Timeout | undefined;

  function schema(name: "recipe" | "configuration") {
    const file = options.schemas?.[name];
    if (!file) throw new OutpostError("configuration", "Schema unavailable");
    let loaded = schemas.get(name);
    if (!loaded) {
      loaded = readFile(file, "utf8").then((text): unknown => JSON.parse(text));
      schemas.set(name, loaded);
    }
    return loaded;
  }

  function watch(): () => void {
    watchers++;
    poller ??= setInterval(() => {
      session.checkDisk().catch(() => undefined);
    }, options.diskPollMs ?? recipeEditorServerDefaults.diskPollMs);
    poller.unref();
    return () => {
      watchers--;
      if (watchers || !poller) return;
      clearInterval(poller);
      poller = undefined;
    };
  }

  return {
    "GET /api/session": recipeEditorRoute(
      async (): Promise<RecipeEditorSessionInfo> => ({
        directory: session.root.directory,
        version: options.version,
        suggested: options.suggested ?? {},
        files: Object.fromEntries(
          Object.entries(session.files()).map(([role, file]) => [
            role,
            session.root.relative(file),
          ]),
        ),
        starters: Object.entries(recipeEditorStarters).map(
          ([name, starter]) => ({
            name,
            description: starter.description,
          }),
        ),
      }),
    ),
    "GET /api/files": recipeEditorRoute(async ({ query }) =>
      listEditorDirectory(
        session.root,
        query.get("path") ?? "",
        recipeEditorServerDefaults.directoryEntries,
      ),
    ),
    "GET /api/schemas/recipe": recipeEditorRoute(() => schema("recipe")),
    "GET /api/schemas/configuration": recipeEditorRoute(() =>
      schema("configuration"),
    ),
    "GET /api/project": recipeEditorRoute(async () => session.state()),
    "GET /api/project/plan": recipeEditorRoute(() => session.plan()),
    "POST /api/project/open": recipeEditorRoute(({ body }) =>
      session.open(decoders.open.parse(body)),
    ),
    "POST /api/project/edit": recipeEditorRoute(({ body }) => {
      const request = decoders.edit.parse(body);
      return session.edit(request.role, request.operations, request.revision);
    }),
    "POST /api/project/text": recipeEditorRoute(({ body }) => {
      const request = decoders.text.parse(body);
      return session.replaceText(request.role, request.text, request.revision);
    }),
    "POST /api/project/layout": recipeEditorRoute(({ body }) => {
      const request = decoders.layout.parse(body);
      return session.setLayout(
        recipeEditorLayout(request.layout),
        request.revision,
      );
    }),
    "POST /api/project/undo": recipeEditorRoute(({ body }) =>
      session.undo(decoders.revision.parse(body).revision),
    ),
    "POST /api/project/redo": recipeEditorRoute(({ body }) =>
      session.redo(decoders.revision.parse(body).revision),
    ),
    "POST /api/project/save": recipeEditorRoute(({ body }) =>
      session.save(decoders.save.parse(body ?? {})),
    ),
    "POST /api/project/reload": recipeEditorRoute(() => session.reload()),
    "GET /api/events": async () => ({
      events: async (stream, signal) => {
        stream.send("state", session.state());
        const unsubscribe = session.subscribe((state) =>
          stream.send("state", state),
        );
        const release = watch();
        try {
          await aborted(signal);
        } finally {
          unsubscribe();
          release();
        }
      },
    }),
  };
}
