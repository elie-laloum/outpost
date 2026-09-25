import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile, symlink, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { root, scenarios } from "./example-scenarios.mjs";

const engine = process.env.OUTPOST_DOCS_ENGINE ?? "docker";
assert.ok(["docker", "podman"].includes(engine), "Choose docker or podman");
const selected = (await scenarios()).filter(
  (item) => item.mode === "sandbox" && !item.name.startsWith("fr/"),
);
const directory = resolve(root, "docs/.examples");
await mkdir(resolve(directory, "node_modules/@elie-laloum"), {
  recursive: true,
});
await symlink(
  root,
  resolve(directory, "node_modules/@elie-laloum/outpost"),
  "junction",
).catch((error) => {
  if (error.code !== "EEXIST") throw error;
});
let executed = 0;
for (const scenario of selected) {
  const workspace = await mkdtemp(resolve(directory, "container-"));
  const workflow = resolve(workspace, "workflow");
  await mkdir(workflow);
  try {
    for (const [name, source] of scenario.files) {
      const target = name === "prepare.mjs" ? workspace : workflow;
      const content =
        engine === "podman" && !scenario.name.includes("providers/containers")
          ? source.replace(
              'import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";',
              'import { podmanSandboxProvider as dockerSandboxProvider } from "@elie-laloum/outpost/providers/podman";',
            )
          : source;
      await writeFile(resolve(target, name), content);
    }
    execFileSync(process.execPath, ["prepare.mjs"], {
      cwd: workspace,
      stdio: "pipe",
    });
    const output = execFileSync(process.execPath, ["example.mts", engine], {
      cwd: workflow,
      timeout: 120_000,
      encoding: "utf8",
      stdio: "pipe",
    });
    assert.ok(output.trim(), `Missing observable result: ${scenario.name}`);
    console.log(`${engine}: ${scenario.name}`);
    executed++;
  } catch (error) {
    console.error(`Failed scenario: ${scenario.name}`);
    throw error;
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}
console.log(
  `${executed} documented scenarios executed on ${engine}; no model calls.`,
);
