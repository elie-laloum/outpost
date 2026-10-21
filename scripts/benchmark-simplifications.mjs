import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const root = fileURLToPath(new URL("../", import.meta.url));
const selected = process.argv[2];

// Counts filesystem traversals through fs/promises, including named imports in loaded modules.
function countFilesystemCalls() {
  const calls = { readdir: 0, opendir: 0, lstat: 0, stat: 0 };
  for (const name of Object.keys(calls)) {
    const original = fs.promises[name];
    fs.promises[name] = (...args) => {
      calls[name]++;
      return original(...args);
    };
  }
  syncBuiltinESMExports();
  return calls;
}

async function quietly(operation) {
  const write = process.stdout.write;
  process.stdout.write = () => true;
  try {
    return await operation();
  } finally {
    process.stdout.write = write;
  }
}

async function validateProject() {
  const { runCli } = await import("../src/cli/commands.ts");
  const directory = await mkdtemp(join(tmpdir(), "outpost-benchmark-"));
  try {
    const recipe = join(directory, "recipe.yaml");
    const config = join(directory, "outpost.yaml");
    await writeFile(
      recipe,
      "version: 3\nname: probe\ntasks:\n  - key: result\n    value: 1\n",
    );
    await writeFile(
      config,
      "version: 3\nworkspace: { kind: ephemeral }\nsandbox: { provider: local }\n",
    );
    await quietly(() =>
      runCli(["recipe", "validate", "--file", recipe, "--config", config]),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function settleFiles(files) {
  const { createSandbox } = await import("../src/core.ts");
  const { createLocalSandboxProvider } =
    await import("../src/providers/local.ts");
  const calls = countFilesystemCalls();
  const directory = await mkdtemp(join(tmpdir(), "outpost-benchmark-"));
  let before;
  try {
    {
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
      before = { ...calls };
      await sandbox.command({
        executable: process.execPath,
        arguments: ["-e", "process.exit(0)"],
      });
    }
    return Object.fromEntries(
      Object.entries(calls).map(([name, count]) => [
        name,
        count - before[name],
      ]),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

const operations = {
  cli: async () => {
    const { runCli } = await import("../src/cli/commands.ts");
    await quietly(() =>
      runCli(["--help"]).catch((error) => {
        if (error?.code !== "commander.helpDisplayed") throw error;
      }),
    );
  },
  core: async () => {
    await import("../src/core.ts");
  },
  recipes: async () => {
    await import("../src/recipes.ts");
  },
  schemas: async () => {
    await import("../src/application/recipes/native-schemas.constants.ts");
  },
  parse: async () => {
    const { parseRecipe } = await import("../src/infrastructure/recipe.ts");
    parseRecipe(
      "version: 3\nname: probe\ntasks:\n  - key: result\n    value: 1\n",
    );
  },
  validation: validateProject,
  settlement: async () => {
    const files = 1000;
    return { files, filesystemCalls: await settleFiles(files) };
  },
};

if (!selected) {
  const samples = [];
  for (const name of Object.keys(operations)) {
    for (let iteration = 0; iteration < 3; iteration++) {
      const start = performance.now();
      const child = spawnSync(
        process.execPath,
        [fileURLToPath(import.meta.url), name],
        { cwd: root, encoding: "utf8", timeout: 120_000 },
      );
      if (child.status !== 0)
        throw new Error(child.stderr || `Benchmark ${name} failed`);
      samples.push({
        name,
        iteration,
        processMs: performance.now() - start,
        ...JSON.parse(child.stdout),
      });
    }
  }
  process.stdout.write(
    `${JSON.stringify({ node: process.version, platform: process.platform, samples }, null, 2)}\n`,
  );
} else {
  const operation = operations[selected];
  if (!operation) throw new Error(`Unknown benchmark case: ${selected}`);
  const start = performance.now();
  const details = await operation();
  process.stdout.write(
    `${JSON.stringify({ operationMs: performance.now() - start, peakRssKiB: process.resourceUsage().maxRSS, ...details })}\n`,
  );
}
