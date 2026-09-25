import { readFile } from "node:fs/promises";
import { imageRecipe, providerPackages } from "./scaffold.constants.ts";
import type { InitOptions } from "./scaffold.types.ts";
import { authenticationEnvironment } from "./init-authentication.ts";
import { starter } from "./starters.ts";

export async function scaffoldFiles(
  options: InitOptions,
  hasPackage: boolean,
  extension: "ts" | "mts",
): Promise<Record<string, string>> {
  const sandboxProvider = options.sandboxProvider ?? "docker";
  const files: Record<string, string> = {
    [`run.${extension}`]: starter(options),
    "brief.md":
      "Objective: {{OBJECTIVE}}\n\nWork on {{WORK_BRANCH}} from {{BASE_BRANCH}}. Inspect the repository, implement the objective, run relevant tests and commit your changes. When finished, write <outpost>done</outpost>.\n",
    ".env.example": authenticationEnvironment(options),
    ".gitignore":
      "node_modules/\n.env\n.outpost/workspaces/\n.outpost/locks/\n.outpost/recovery/\n.outpost/logs/\n",
  };
  if (sandboxProvider === "docker" || sandboxProvider === "podman")
    files[sandboxProvider === "docker" ? "Dockerfile" : "Containerfile"] =
      imageRecipe;

  if (!hasPackage) {
    const manifest = JSON.parse(
      await readFile(new URL("../../package.json", import.meta.url), "utf8"),
    );
    files["package.json"] =
      JSON.stringify(
        {
          private: true,
          type: "module",
          scripts: { start: `node run.${extension}` },
          engines: { node: ">=24" },
          devDependencies: {
            "@elie-laloum/outpost": `^${manifest.version}`,
            ...Object.fromEntries(
              providerPackages[sandboxProvider].map((name) => [
                name,
                manifest.peerDependencies[name],
              ]),
            ),
          },
        },
        null,
        2,
      ) + "\n";
  }
  return files;
}
