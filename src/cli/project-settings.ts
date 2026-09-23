import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { invariant } from "../domain/errors.ts";
import { managerLocks, supportedManagers } from "./scaffold.constants.ts";
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
  let hasPackage = true;
  try {
    pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    if (!pkg || typeof pkg !== "object") pkg = {};
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "ENOENT") hasPackage = false;
    if (
      !(cause instanceof SyntaxError) &&
      (cause as NodeJS.ErrnoException).code !== "ENOENT"
    )
      throw cause;
  }
  let detected =
    typeof pkg.packageManager === "string"
      ? pkg.packageManager.split("@")[0]
      : undefined;
  if (!detected || !supportedManagers.includes(detected)) {
    detected = undefined;
    for (const [file, manager] of managerLocks) {
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
  invariant(supportedManagers.includes(manager), "Unknown package manager");

  return {
    hasPackage,
    manager,
    extension: pkg.type === "commonjs" ? "mts" : "ts",
  };
}
