import {
  appendFile,
  lstat,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { imageName } from "../providers/container.ts";
import { manageImage } from "./image.ts";
import { projectSettings } from "./project-settings.ts";
import { scaffoldFiles } from "./scaffold-files.ts";
import { validateInitialization } from "./scaffold-validation.ts";
import { providerPackages } from "./scaffold.constants.ts";
import type { InitOptions, ScaffoldResult } from "./scaffold.types.ts";

export { manageImage } from "./image.ts";
export { imageRecipe } from "./scaffold.constants.ts";
export type { InitOptions } from "./scaffold.types.ts";

export async function initialize(
  options: InitOptions = {},
  executor?: Executor,
): Promise<ScaffoldResult> {
  const root = resolve(options.directory ?? process.cwd());
  const sandboxProvider = options.sandboxProvider ?? "docker";
  validateInitialization(options);
  const { hasPackage, manager, extension } = await projectSettings(
    root,
    options,
  );
  if (options.install) {
    try {
      await requireSuccess(
        process.platform === "win32"
          ? {
              executable: "cmd.exe",
              arguments: ["/d", "/c", `${manager} --version`],
            }
          : { executable: manager, arguments: ["--version"] },
        executor,
      );
    } catch {
      throw new OutpostError(
        "configuration",
        `Package manager ${manager} is unavailable. Install it or select an installed manager with --manager before using --install.`,
      );
    }
  }
  const files = await scaffoldFiles(
    { ...options, image: options.image ?? imageName(root) },
    hasPackage,
    extension,
  );
  const existingIgnore = await readFile(join(root, ".gitignore"), "utf8").catch(
    (error) => {
      if (error.code === "ENOENT") return undefined;
      throw error;
    },
  );
  const ignore = files[".gitignore"]!;
  if (existingIgnore !== undefined) delete files[".gitignore"];
  for (const name of Object.keys(files))
    if (
      await lstat(join(root, name))
        .then(() => true)
        .catch((error) => {
          if (error.code === "ENOENT") return false;
          throw error;
        })
    )
      throw new OutpostError(
        "configuration",
        `Initialization would overwrite ${name}`,
      );
  await mkdir(root, { recursive: true });
  for (const [name, content] of Object.entries(files))
    await writeFile(join(root, name), content, { flag: "wx" });
  if (existingIgnore !== undefined) {
    const rules = new Set(existingIgnore.split(/\r?\n/));
    const additions = ignore
      .trimEnd()
      .split("\n")
      .filter((rule) => !rules.has(rule));
    if (additions.length) {
      const suffix = `${existingIgnore && !existingIgnore.endsWith("\n") ? "\n" : ""}${additions.join("\n")}\n`;
      await appendFile(join(root, ".gitignore"), suffix);
      files[".gitignore"] = existingIgnore + suffix;
    }
  }
  if (options.install) {
    const packages = [
      "@elie-laloum/outpost",
      ...providerPackages[sandboxProvider],
    ];
    const args =
      manager === "npm"
        ? ["install", "--save-dev", ...packages]
        : ["add", "--dev", ...packages];
    await requireSuccess(
      process.platform === "win32"
        ? {
            executable: "cmd.exe",
            arguments: ["/d", "/c", [manager, ...args].join(" ")],
            directory: root,
          }
        : { executable: manager, arguments: args, directory: root },
      executor,
    );
  }
  if (
    options.build &&
    (sandboxProvider === "docker" || sandboxProvider === "podman")
  )
    await manageImage(
      "build",
      {
        directory: root,
        engine: sandboxProvider,
        ...(options.image ? { image: options.image } : {}),
      },
      executor,
    );
  return {
    files: Object.keys(files).map((name) => join(root, name)),
    run: `node run.${extension}`,
  };
}
