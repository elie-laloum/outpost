import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { initialize, manageImage } from "../../src/cli/scaffold.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import type { Command } from "../../src/domain/ports.ts";
import { emit, repository } from "../helpers.ts";

test("initialization defaults to TypeScript and preserves existing module formats", async (t) => {
  const root = await repository(t);
  for (const type of ["module", "commonjs"]) {
    const path = join(root, type);
    await mkdir(path);
    await writeFile(join(path, "package.json"), JSON.stringify({ type }));
    const result = await initialize({
      directory: path,
      model: 'model"quoted',
      provider: "docker",
    });
    const extension = type === "commonjs" ? "mts" : "ts";
    assert.equal(result.run, `node run.${extension}`);
    assert.equal(
      await readFile(join(path, "package.json"), "utf8"),
      JSON.stringify({ type }),
    );
    const source = join(path, `run.${extension}`);
    const checked = await executeProcess({
      executable: process.execPath,
      arguments: ["--check", source],
    });
    assert.equal(checked.status, 0, checked.stderr);
    assert.match(
      await readFile(join(path, "Dockerfile"), "utf8"),
      /@openai\/codex/,
    );
    await assert.rejects(initialize({ directory: path }), /overwrite/);
  }
});

test("initialization supports cloud peers and requested package manager", async (t) => {
  const root = await repository(t),
    calls: Command[] = [];
  const executor = async (command: Command) => {
    calls.push(command);
    return { status: 0, stdout: "", stderr: "" };
  };
  const result = await initialize(
    {
      directory: root,
      agent: "claude",
      provider: "vercel",
      manager: "pnpm",
      install: true,
    },
    executor,
  );
  assert.equal(result.run, "node run.ts");
  assert.ok(
    calls.some((call) => call.arguments?.join(" ").includes("@vercel/sandbox")),
  );
  assert.deepEqual(
    calls.map((call) => call.executable),
    [process.platform === "win32" ? "cmd.exe" : "pnpm"],
  );
  assert.equal(
    await readFile(join(root, ".env.example"), "utf8"),
    "ANTHROPIC_API_KEY=\n",
  );
  for (const provider of ["daytona", "podman", "local"] as const) {
    const folder = join(root, provider);
    await mkdir(folder);
    await initialize(
      { directory: folder, provider, install: true, manager: "yarn" },
      executor,
    );
  }
});

test("image management uses explicit Dockerfile and numeric build arguments", async (t) => {
  const root = await repository(t),
    calls: Command[] = [];
  const executor = async (command: Command) => {
    calls.push(command);
    return { status: 0, stdout: "", stderr: "" };
  };
  assert.equal(
    await manageImage(
      "build",
      {
        directory: root,
        engine: "podman",
        image: "custom:1",
        file: "custom.Containerfile",
        uid: 1234,
        gid: 2345,
      },
      executor,
    ),
    "custom:1",
  );
  assert.ok(calls[0]?.arguments?.includes("AGENT_UID=1234"));
  assert.ok(calls[0]?.arguments?.includes(join(root, "custom.Containerfile")));
  await manageImage("remove", { directory: root }, executor);
  assert.deepEqual(calls[1]?.arguments?.slice(0, 2), ["image", "rm"]);
  await assert.rejects(manageImage("build", { uid: -1 }, executor), /UID/);
});

test("generated starter uses an external repository, workflow credentials and brief from another cwd", async (t) => {
  const root = await repository(t);
  const folder = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-workflow-")),
  );
  t.after(() => rm(folder, { recursive: true, force: true }));
  await initialize({
    directory: folder,
    repository: relative(folder, root),
    provider: "local",
    agent: "codex",
  });
  await writeFile(
    join(folder, ".env"),
    "WORKFLOW_VALUE=from-workflow\nINHERITED_VALUE=\n",
  );
  await mkdir(join(root, ".outpost"), { recursive: true });
  await writeFile(
    join(root, ".outpost", ".env"),
    "WORKFLOW_VALUE=from-repository\n",
  );
  const bridge = join(folder, "bridge.mts");
  const source = new URL("../../src/index.ts", import.meta.url).href;
  const helper = new URL("../helpers.ts", import.meta.url).href;
  await writeFile(
    bridge,
    `export { dispatch, OutpostError, reporter } from ${JSON.stringify(source)}; import {scripted} from ${JSON.stringify(helper)}; export const codex = () => scripted(input => { if (!input.text.includes('Ship generated feature')) throw Error('Missing objective'); return ${JSON.stringify("import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process'; if (process.env.WORKFLOW_VALUE !== 'from-workflow' || process.env.INHERITED_VALUE !== 'from-process') throw Error('Wrong environment'); writeFileSync('generated.txt', 'implemented'); execFileSync('git',['add','generated.txt']); execFileSync('git',['commit','-m','generated feature']);" + emit("<outpost>done</outpost>"))}; });`,
  );
  const runner = join(folder, "run.ts");
  let content = await readFile(runner, "utf8");
  content = content
    .replaceAll(
      '"@elie-laloum/outpost"',
      JSON.stringify(pathToFileURL(bridge).href),
    )
    .replace(
      '"@elie-laloum/outpost/providers/local"',
      JSON.stringify(
        new URL("../../src/providers/local.ts", import.meta.url).href,
      ),
    );
  await writeFile(runner, content);
  const output = await executeProcess({
    executable: process.execPath,
    arguments: [runner, "Ship generated feature"],
    directory: tmpdir(),
    variables: { INHERITED_VALUE: "from-process" },
  });
  assert.equal(output.status, 0, output.stderr);
  assert.equal(
    await readFile(join(root, "generated.txt"), "utf8"),
    "implemented",
  );
  assert.match(output.stdout, /generated feature/);
});

test("initialization creates a standalone package with provider dependencies and merges ignore rules", async (t) => {
  const temporary = await mkdtemp(join(tmpdir(), "outpost-init-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const folder = join(temporary, "nested", "workflow");
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, ".gitignore"), "custom/\n.env");
  const result = await initialize({ directory: folder, provider: "daytona" });
  assert.deepEqual((await readdir(folder)).sort(), [
    ".env.example",
    ".gitignore",
    "brief.md",
    "package.json",
    "run.ts",
  ]);
  const manifest = JSON.parse(
    await readFile(join(folder, "package.json"), "utf8"),
  );
  const own = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8"),
  );
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, "module");
  assert.equal(manifest.scripts.start, "node run.ts");
  assert.equal(
    manifest.devDependencies["@elie-laloum/outpost"],
    `^${own.version}`,
  );
  assert.equal(
    manifest.devDependencies["@daytona/sdk"],
    own.peerDependencies["@daytona/sdk"],
  );
  assert.equal(
    await readFile(join(folder, ".gitignore"), "utf8"),
    "custom/\n.env\nnode_modules/\n.outpost/workspaces/\n.outpost/locks/\n.outpost/recovery/\n.outpost/logs/\n",
  );
  assert.ok(result.files.includes(join(folder, "package.json")));
  const fresh = join(temporary, "new-workflow");
  await initialize({ directory: fresh, provider: "local" });
  assert.ok((await readdir(fresh)).includes("run.ts"));
});

test("initialization checks all collisions before writing or updating files", async (t) => {
  const root = await repository(t);
  await writeFile(join(root, "brief.md"), "keep brief");
  await writeFile(join(root, ".gitignore"), "keep ignore");
  const before = await readdir(root);
  await assert.rejects(initialize({ directory: root }), /overwrite brief.md/);
  assert.deepEqual(await readdir(root), before);
  assert.equal(await readFile(join(root, ".gitignore"), "utf8"), "keep ignore");
  assert.equal(await readFile(join(root, "brief.md"), "utf8"), "keep brief");
});

test("generated container starter uses the image built in the workflow directory", async (t) => {
  const temporary = await mkdtemp(join(tmpdir(), "outpost-image-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  for (const provider of ["docker", "podman"] as const) {
    for (const image of [undefined, "outpost:custom"]) {
      const folder = join(
        temporary,
        `${provider}-${image ? "custom" : "default"}`,
      );
      const calls: Command[] = [];
      await initialize(
        {
          directory: folder,
          repository: "/external/repository",
          provider,
          build: true,
          ...(image ? { image } : {}),
        },
        async (command) => {
          calls.push(command);
          return { status: 0, stdout: "", stderr: "" };
        },
      );
      const source = await readFile(join(folder, "run.ts"), "utf8");
      const build = calls[0]!;
      const tag = build.arguments![build.arguments!.indexOf("--tag") + 1];
      assert.ok(source.includes(`image: ${JSON.stringify(tag)}`));
      assert.ok(
        build.arguments!.includes(
          join(folder, provider === "docker" ? "Dockerfile" : "Containerfile"),
        ),
      );
      assert.equal(build.directory, folder);
    }
  }
});
