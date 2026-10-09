import { lstat, writeFile } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  starterRecipe,
  starterRecipeConfiguration,
  starterFileRecipe,
  starterFileConfigurations,
} from "./recipe-init.constants.ts";
import type { CliInvocation } from "./main.types.ts";

export async function initializeRecipe({
  values,
}: CliInvocation): Promise<void> {
  if (!values.file) throw new Error("Recipe init requires --file recipe.yaml");
  const file = resolve(values.file);
  const kind = values["workspace-kind"] ?? "git";
  if (kind !== "git" && kind !== "directory" && kind !== "ephemeral")
    throw new Error("Unsupported workspace kind");
  const configuration = values.config ? resolve(values.config) : undefined;
  if (configuration === file)
    throw new Error("Recipe and configuration require separate files");
  if (configuration && !/\.ya?ml$/.test(configuration))
    throw new Error("Recipe init configuration must be YAML");
  for (const path of [file, ...(configuration ? [configuration] : [])]) {
    const existing = await lstat(path).catch((error: unknown) => {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      )
        return undefined;
      throw error;
    });
    if (existing) throw new Error(`Refusing to overwrite ${path}`);
  }
  const schema = relative(
    dirname(file),
    fileURLToPath(new URL("../../recipe.schema.json", import.meta.url)),
  ).replaceAll("\\", "/");
  await writeFile(
    file,
    `# yaml-language-server: $schema=${schema}\n${kind === "git" ? starterRecipe : starterFileRecipe}`,
    { flag: "wx" },
  );
  if (configuration) {
    const schema = relative(
      dirname(configuration),
      fileURLToPath(
        new URL("../../recipe-configuration.schema.json", import.meta.url),
      ),
    ).replaceAll("\\", "/");
    await writeFile(
      configuration,
      `# yaml-language-server: $schema=${schema}\n${kind === "git" ? starterRecipeConfiguration : starterFileConfigurations[kind]}`,
      { flag: "wx" },
    );
  }
  process.stdout.write(
    values.json
      ? `${JSON.stringify({ file, schema, configuration })}\n`
      : `Created ${file}${configuration ? ` and ${configuration}` : ""}\n`,
  );
}
