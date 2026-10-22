import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRecipeEditorSession } from "../application/recipe-editor/session.ts";
import { recipeEditorRoutes } from "../application/recipe-editor/routes.ts";
import { openBrowser } from "../infrastructure/browser.ts";
import { openEditorRoot } from "../infrastructure/editor-files.ts";
import { serveEditor } from "../infrastructure/editor-server.ts";
import { packageVersion } from "./package-version.ts";
import type { CliInvocation } from "./main.types.ts";

const cliEntry = new URL(
  `./main${extname(fileURLToPath(import.meta.url))}`,
  import.meta.url,
);

const packageFile = (name: string) =>
  fileURLToPath(new URL(`../../${name}`, import.meta.url));

function port(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 65_535)
    throw new Error("--port must be an integer between 0 and 65535");
  return parsed;
}

/** Serves the recipe editor on the loopback interface until interrupted. */
export async function recipeEditorCommand({
  values,
}: CliInvocation): Promise<void> {
  const root = await openEditorRoot(values.directory ?? process.cwd());
  const inside = (file: string) =>
    relative(root.directory, resolve(file)).replaceAll("\\", "/");
  const schemas = {
    recipe: packageFile("recipe.schema.json"),
    configuration: packageFile("recipe-configuration.schema.json"),
  };
  const session = createRecipeEditorSession({ root, schemas });
  const recipe = values.file && resolve(values.file);
  const config = values.config && resolve(values.config);
  const suggested = {
    ...(recipe ? { recipe: inside(recipe) } : {}),
    ...(config ? { config: inside(config) } : {}),
  };
  if (recipe && existsSync(recipe))
    await session.open({
      recipe: inside(recipe),
      ...(config && existsSync(config) ? { config: inside(config) } : {}),
    });
  const assets = packageFile("dist/editor");
  const token = randomBytes(32).toString("base64url");
  const listen = port(values.port);
  const server = await serveEditor({
    routes: recipeEditorRoutes({
      session,
      schemas,
      suggested,
      version: packageVersion(),
      cli: [process.execPath, fileURLToPath(cliEntry)],
    }),
    token,
    ...(existsSync(assets) ? { assets } : {}),
    ...(listen === undefined ? {} : { port: listen }),
  });
  const url = `${server.url}/#token=${token}`;
  process.stdout.write(
    values.json
      ? `${JSON.stringify({ url, directory: root.directory })}\n`
      : `Outpost recipe editor: ${url}\nEditing ${root.directory}. Press Ctrl+C to stop.\n`,
  );
  if (!existsSync(assets))
    process.stderr.write(
      "Warning: the editor web application is not built; only its API is available.\n",
    );
  if (values.open !== false) openBrowser(url);
  await new Promise<void>((done) => {
    const stop = (code: number) => {
      process.exitCode = code;
      process.off("SIGINT", interrupt);
      process.off("SIGTERM", terminate);
      done();
    };
    const interrupt = () => stop(130);
    const terminate = () => stop(143);
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", terminate);
  });
  await server.close();
}
