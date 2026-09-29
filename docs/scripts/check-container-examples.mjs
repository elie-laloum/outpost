import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  writeFile,
  symlink,
  rm,
} from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const engine = process.env.OUTPOST_DOCS_ENGINE ?? "docker";
assert.ok(["docker", "podman"].includes(engine), "Choose docker or podman");
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
for (const locale of ["", "fr/"]) {
  const workspace = await mkdtemp(resolve(directory, "command-"));
  try {
    const content = resolve(root, `docs/src/content/docs/${locale}guide`);
    const setup = await readFile(resolve(content, "setup.md"), "utf8");
    const page = await readFile(
      resolve(content, "sandbox-sessions.md"),
      "utf8",
    );
    let config = setup.match(
      /```ts title="outpost\.config\.mts"\n([\s\S]*?)```/,
    )[1];
    config = config.replace(
      '"outpost:dev"',
      JSON.stringify(process.env.OUTPOST_DOCS_IMAGE ?? "outpost:docs-demo"),
    );
    if (engine === "podman")
      config = config.replace(
        'import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";',
        'import { createPodmanSandboxProvider as createDockerSandboxProvider } from "@elie-laloum/outpost/providers/podman";',
      );
    await writeFile(resolve(workspace, "outpost.config.mts"), config);
    await writeFile(
      resolve(workspace, "command.mts"),
      page.match(/```ts title="command\.mts"\n([\s\S]*?)```/)[1],
    );
    execFileSync("git", ["init", "--quiet"], { cwd: workspace });
    execFileSync(
      "git",
      [
        "-c",
        "user.name=Documentation",
        "-c",
        "user.email=docs@example.test",
        "commit",
        "--quiet",
        "--allow-empty",
        "-m",
        "fixture",
      ],
      { cwd: workspace },
    );
    const output = execFileSync(process.execPath, ["command.mts"], {
      cwd: workspace,
      encoding: "utf8",
      timeout: 120_000,
      env: { ...process.env, OUTPOST_REPOSITORY: workspace },
    });
    assert.match(output.trim(), /^v\d+\.\d+\.\d+$/);
    console.log(
      `${engine}: ${locale || "en/"}sandbox-sessions command snippet passed`,
    );
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}
