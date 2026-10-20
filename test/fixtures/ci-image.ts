// Builds the all-agent image used by container tests from the official recipe generator.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { builtInAgents } from "../../src/adapters/agents/catalog.ts";
import { combinedImageRecipe } from "../../src/cli/image-recipes.ts";

const [engine = "docker", tag = "outpost-ci:latest"] = process.argv.slice(2);
assert.ok(engine === "docker" || engine === "podman");
const directory = await mkdtemp(join(tmpdir(), "outpost-ci-image-"));
try {
  for (const agent of builtInAgents) {
    if (agent.install.kind !== "npm") continue;
    await mkdir(join(directory, agent.name));
    for (const file of ["package.json", "package-lock.json"])
      await copyFile(
        new URL(`../../images/${agent.name}/${file}`, import.meta.url),
        join(directory, agent.name, file),
      );
  }
  await writeFile(
    join(directory, "Dockerfile"),
    combinedImageRecipe(
      { name: "ci", description: "Every built-in agent for container tests" },
      builtInAgents,
    ),
  );
  execFileSync(
    engine,
    [
      "build",
      "--tag",
      tag,
      "--build-arg",
      `AGENT_UID=${process.getuid?.() ?? 1000}`,
      "--build-arg",
      `AGENT_GID=${process.getgid?.() ?? 1000}`,
      directory,
    ],
    { stdio: "inherit" },
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
