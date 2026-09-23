import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { invariant } from "../domain/errors.ts";
import type {
  InitOptions,
  PackageManifest,
  ProjectSettings,
} from "./scaffold.types.ts";

export async function projectSettings(
  root: string,
  options: InitOptions,
): Promise<ProjectSettings> {
  let pkg: PackageManifest = {};
  try {
    pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    if (!pkg || typeof pkg !== "object") pkg = {};
  } catch (cause) {
    if (
      !(cause instanceof SyntaxError) &&
      (cause as NodeJS.ErrnoException).code !== "ENOENT"
    )
      throw cause;
  }
  const extension = pkg.type === "module" ? "ts" : "mts";
  let detected =
    typeof pkg.packageManager === "string"
      ? pkg.packageManager.split("@")[0]
      : undefined;
  if (!detected || !["npm", "pnpm", "yarn", "bun"].includes(detected)) {
    detected = undefined;
    for (const [file, manager] of [
      ["pnpm-lock.yaml", "pnpm"],
      ["yarn.lock", "yarn"],
      ["bun.lock", "bun"],
      ["bun.lockb", "bun"],
    ]) {
      if (
        await access(join(root, file!))
          .then(() => true)
          .catch(() => false)
      ) {
        detected = manager;
        break;
      }
    }
  }
  const manager = options.manager ?? detected ?? "npm";
  invariant(
    ["npm", "pnpm", "yarn", "bun"].includes(manager),
    "Unknown package manager",
  );

  return { extension, manager };
}
