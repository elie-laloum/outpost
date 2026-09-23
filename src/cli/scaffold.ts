import { access, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { invariant, OutpostError } from "../domain/errors.ts";
import { requireSuccess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { manageImage } from "./image.ts";
import { projectSettings } from "./project-settings.ts";
import { scaffoldFiles } from "./scaffold-files.ts";
import { validateInitialization } from "./scaffold-validation.ts";
import type { InitOptions, ScaffoldResult } from "./scaffold.types.ts";

export { manageImage } from "./image.ts";
export { imageRecipe } from "./scaffold.constants.ts";
export type { InitOptions, Template } from "./scaffold.types.ts";

export async function initialize(
  options: InitOptions = {},
  executor?: Executor,
): Promise<ScaffoldResult> {
  const root = resolve(options.directory ?? process.cwd()),
    folder = join(root, ".outpost");
  const provider = options.provider ?? "docker";
  validateInitialization(options);
  const { extension, manager } = await projectSettings(root, options);
  const files = scaffoldFiles(options, extension);
  for (const name of Object.keys(files))
    if (
      await access(join(folder, name))
        .then(() => true)
        .catch(() => false)
    )
      throw new OutpostError(
        "configuration",
        `Initialization would overwrite .outpost/${name}`,
      );
  await mkdir(folder, { recursive: true });
  for (const [name, content] of Object.entries(files))
    await writeFile(join(folder, name), content, { flag: "wx" });
  if (options.install) {
    const packages = [
      "@elie-laloum/outpost",
      ...(provider === "vercel"
        ? ["@vercel/sandbox"]
        : provider === "daytona"
          ? ["@daytona/sdk"]
          : []),
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
  if (options.label) {
    invariant(
      options.tracker === "github",
      "Labels require the GitHub tracker",
    );
    await requireSuccess(
      {
        executable: "gh",
        arguments: [
          "label",
          "create",
          options.label,
          "--color",
          "4969ED",
          "--description",
          "Ready for Outpost",
          "--force",
        ],
        directory: root,
      },
      executor,
    );
  }
  if (options.build && (provider === "docker" || provider === "podman"))
    await manageImage(
      "build",
      {
        directory: root,
        engine: provider,
        ...(options.image ? { image: options.image } : {}),
      },
      executor,
    );
  return {
    files: Object.keys(files).map((name) => join(folder, name)),
    run: `node .outpost/run.${extension}`,
  };
}
