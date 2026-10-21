import { spawnSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const root = fileURLToPath(new URL("../", import.meta.url));
const selected = process.argv[2];
if (!selected) {
  const samples = [];
  for (const name of [
    "cli",
    "core",
    "recipes",
    "schemas",
    "validation",
    "settlement",
  ]) {
    for (let iteration = 0; iteration < 3; iteration++) {
      const start = performance.now();
      const args =
        name === "cli"
          ? ["src/cli/main.ts", "--help"]
          : [fileURLToPath(import.meta.url), name];
      const child = spawnSync(process.execPath, args, {
        cwd: root,
        encoding: "utf8",
        timeout: 120_000,
      });
      if (child.status !== 0)
        throw new Error(child.stderr || `Benchmark ${name} failed`);
      samples.push({
        name,
        iteration,
        processMs: performance.now() - start,
        ...(name === "cli" ? {} : JSON.parse(child.stdout)),
      });
    }
  }
  process.stdout.write(
    `${JSON.stringify({ node: process.version, platform: process.platform, samples }, null, 2)}\n`,
  );
} else {
  const start = performance.now();
  let files;
  switch (selected) {
    case "core":
      await import("../src/core.ts");
      break;
    case "recipes":
      await import("../src/recipes.ts");
      break;
    case "schemas":
      await import("../src/application/recipes/native-schemas.constants.ts");
      break;
    case "validation": {
      const { parseRecipe } = await import("../src/infrastructure/recipe.ts");
      parseRecipe(
        "version: 3\nname: probe\ntasks:\n  - key: result\n    value: 1\n",
      );
      break;
    }
    case "settlement": {
      const { createSandbox } = await import("../src/core.ts");
      const { createLocalSandboxProvider } =
        await import("../src/providers/local.ts");
      const directory = await mkdtemp(join(tmpdir(), "outpost-benchmark-"));
      files = 1000;
      try {
        await using sandbox = await createSandbox({
          workspaceSource: { kind: "ephemeral" },
          runtime: { directory },
          sandboxProvider: createLocalSandboxProvider(),
          logging: false,
        });
        for (let index = 0; index < files; index++)
          await writeFile(
            join(sandbox.workspace.directory, `${index}.txt`),
            "benchmark\n",
          );
        await sandbox.command({
          executable: process.execPath,
          arguments: ["-e", "process.exit(0)"],
        });
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
      break;
    }
    default:
      throw new Error(`Unknown benchmark case: ${selected}`);
  }
  process.stdout.write(
    `${JSON.stringify({ operationMs: performance.now() - start, peakRssKiB: process.resourceUsage().maxRSS, ...(files ? { files } : {}) })}\n`,
  );
}
