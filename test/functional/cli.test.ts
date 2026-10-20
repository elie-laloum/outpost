import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { executeProcess } from "../../src/infrastructure/process.ts";
import {
  buildImage,
  pullImage,
  removeImage,
  verifyImage,
} from "../../src/cli/image.ts";
import { officialImage } from "../../src/cli/image-recipes.ts";
import type { Command } from "../../src/domain/command.types.ts";

const cli = resolve("src/cli/main.ts");
const run = (args: string[], directory?: string) =>
  executeProcess({
    executable: process.execPath,
    arguments: [cli, ...args],
    ...(directory ? { directory } : {}),
  });
const version = JSON.parse(await readFile("package.json", "utf8")).version;

test("CLI groups commands in help, prints its version and reports unknown commands", async () => {
  for (const args of [[], ["--help"]]) {
    const output = await run(args);
    assert.equal(output.status, 0);
    assert.match(output.stdout, /Get started:\n\s+doctor/);
    assert.match(output.stdout, /image\s+List, pull, verify, eject and build/);
    assert.match(output.stdout, /Repair and clean up:/);
    assert.doesNotMatch(output.stdout, /\binit\b/);
  }
  const printed = await run(["--version"]);
  assert.equal(printed.stdout.trim(), version);
  for (const args of [
    ["unknown"],
    ["init"],
    ["image"],
    ["image", "unknown"],
    ["recovery", "transfer"],
  ]) {
    const output = await run(args);
    assert.equal(output.status, 1);
    assert.match(output.stderr, /[Uu]nknown command/);
  }
  const recovery = await run(["recovery", "--help"]);
  assert.match(recovery.stdout, /transfer\s+Verify or restore/);
  assert.doesNotMatch(recovery.stdout, /^\s+verify/m);
});

test("image eject writes the official recipe and lockfiles, then refuses to overwrite", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-eject-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const first = await run(["image", "eject", "--image", "codex"], directory);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /outpost image build --tag outpost-codex:dev/);
  const recipe = await readFile(join(directory, "Dockerfile"), "utf8");
  assert.match(recipe, /^FROM node:24-bookworm-slim@sha256:[a-f0-9]{64}$/m);
  assert.match(recipe, /npm ci --prefix \/opt\/outpost\/[a-z]+ /);
  assert.doesNotMatch(recipe, /claude-code|kimi-code|copilot/);
  const lock = JSON.parse(
    await readFile(join(directory, "package-lock.json"), "utf8"),
  );
  assert.ok(lock.packages["node_modules/@openai/codex"]);
  assert.equal(
    await readFile(join(directory, ".dockerignore"), "utf8"),
    "*\n!Dockerfile\n!package.json\n!package-lock.json\n",
  );
  const repeat = await run(["image", "eject", "--image", "codex"], directory);
  assert.equal(repeat.status, 1);
  assert.match(repeat.stderr, /Refusing to overwrite .*--force/);
  const forced = await run(
    ["image", "eject", "--image", "codex", "--force", "--json"],
    directory,
  );
  assert.equal(forced.status, 0, forced.stderr);
  assert.equal(JSON.parse(forced.stdout).files.length, 4);
  const podman = join(directory, "harness");
  const harness = await run([
    "image",
    "eject",
    "--image",
    "harness",
    "--engine",
    "podman",
    "--directory",
    podman,
  ]);
  assert.equal(harness.status, 0, harness.stderr);
  const containerfile = await readFile(join(podman, "Containerfile"), "utf8");
  assert.doesNotMatch(containerfile, /npm ci|curl/);
  assert.equal(
    await readFile(join(podman, ".dockerignore"), "utf8"),
    "*\n!Containerfile\n",
  );
  const agy = join(directory, "agy");
  assert.equal(
    (
      await run([
        "image",
        "eject",
        "--image",
        "antigravity",
        "--directory",
        agy,
      ])
    ).status,
    0,
  );
  assert.match(
    await readFile(join(agy, "Dockerfile"), "utf8"),
    /curl.*sha512sum/s,
  );
  const unknown = await run(["image", "eject", "--image", "gemini"]);
  assert.match(unknown.stderr, /Unknown image "gemini". Choose harness, codex/);
});

test("image list names every official image and its release reference", async () => {
  const text = await run(["image", "list"]);
  assert.equal(text.status, 0, text.stderr);
  for (const name of [
    "harness",
    "codex",
    "claude",
    "antigravity",
    "copilot",
    "kimi",
  ])
    assert.match(text.stdout, new RegExp(`^${name}\\s`, "m"));
  const json = JSON.parse((await run(["image", "list", "--json"])).stdout);
  const codex = json.find((image: { name: string }) => image.name === "codex");
  assert.equal(codex.agent, "codex");
  assert.ok(
    codex.reference === `ghcr.io/elie-laloum/outpost/codex:${version}` ||
      /@sha256:[a-f0-9]{64}$/.test(codex.reference),
  );
});

test("image build, pull, remove and verify issue the expected engine commands", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-build-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const calls: Command[] = [];
  const executor = async (command: Command) => {
    calls.push(command);
    return { status: 0, stdout: "", stderr: "" };
  };
  await assert.rejects(
    buildImage({ directory, tag: "outpost-codex:dev" }, executor),
    /Run outpost image eject/,
  );
  await assert.rejects(buildImage({ directory }, executor), /--tag/);
  await writeFile(join(directory, "Containerfile"), "FROM scratch\n");
  await buildImage(
    {
      directory,
      engine: "podman",
      tag: "outpost-codex:dev",
      uid: 1234,
      gid: 5,
    },
    executor,
  );
  assert.equal(calls[0]!.executable, "podman");
  assert.deepEqual(calls[0]!.arguments, [
    "build",
    "--tag",
    "outpost-codex:dev",
    "--file",
    join(directory, "Containerfile"),
    "--build-arg",
    "AGENT_UID=1234",
    "--build-arg",
    "AGENT_GID=5",
    directory,
  ]);
  await assert.rejects(
    buildImage({ directory, engine: "podman", tag: "x", uid: -1 }, executor),
    /--uid/,
  );
  const reference = await pullImage(
    officialImage("kimi")!,
    "1.2.3",
    "docker",
    executor,
  );
  assert.match(reference, /^ghcr\.io\/elie-laloum\/outpost\/kimi[:@]/);
  assert.deepEqual(calls.at(-1)!.arguments, ["pull", reference]);
  await removeImage("outpost-codex:dev", "docker", executor);
  assert.deepEqual(calls.at(-1)!.arguments, [
    "image",
    "rm",
    "outpost-codex:dev",
  ]);
  await assert.rejects(removeImage(undefined, "docker", executor), /--image/);
  await assert.rejects(verifyImage("ghcr.io/x/y:latest", executor), /digest/);
  const digest = `ghcr.io/elie-laloum/outpost/codex@sha256:${"a".repeat(64)}`;
  await verifyImage(digest, executor);
  assert.equal(calls.at(-1)!.executable, "gh");
  assert.deepEqual(calls.at(-1)!.arguments!.slice(0, 3), [
    "attestation",
    "verify",
    `oci://${digest}`,
  ]);
  assert.ok(calls.at(-1)!.arguments!.includes("--bundle-from-oci"));
  await assert.rejects(
    verifyImage(digest, async () => ({
      status: 1,
      stdout: "",
      stderr: "no attestation",
    })),
    /no attestation/,
  );
  await assert.rejects(
    verifyImage(digest, async () => {
      throw Object.assign(new Error("spawn gh ENOENT"), { code: "ENOENT" });
    }),
    /requires the GitHub CLI/,
  );
});

test("doctor CLI emits a complete JSON report and exits nonzero when Git is absent", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-doctor-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = await executeProcess({
    executable: process.execPath,
    arguments: [
      cli,
      "doctor",
      "--provider",
      "local",
      "--agent",
      "codex",
      "--json",
    ],
    directory,
    variables: { PATH: directory },
  });
  assert.equal(output.status, 1);
  assert.equal(output.stderr, "");
  const report = JSON.parse(output.stdout);
  assert.equal(report.hasFailures, true);
  assert.equal(report.scope, "host");
  assert.ok(
    report.checks.some(
      (check: { id: string; status: string }) =>
        check.id === "host.git" && check.status === "fail",
    ),
  );
  const invalid = await run(["doctor", "--provider", "constructor"]);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /Unknown provider/);
  const legacy = await run(["doctor", "--sandbox-provider", "constructor"]);
  assert.match(
    legacy.stderr,
    /--sandbox-provider is deprecated; use --provider/,
  );
  assert.match(legacy.stderr, /Unknown provider/);
});

test("CLI scopes help, shows examples and rejects options belonging to another command", async () => {
  const help = await run(["recovery", "transfer", "restore", "--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /--destination/);
  assert.match(help.stdout, /--path/);
  assert.doesNotMatch(help.stdout, /--agent/);
  const imageHelp = await run(["image", "build", "--help"]);
  assert.match(
    imageHelp.stdout,
    /Container recipe filename inside --directory/,
  );
  assert.match(imageHelp.stdout, /Examples:\n\s+\$ outpost image build --tag/);
  const recipeHelp = await run(["recipe", "run", "--help"]);
  assert.match(recipeHelp.stdout, /Recipe YAML path/);
  for (const args of [
    ["doctor", "--install"],
    ["image", "build", "unexpected"],
    ["doctor", "--agent"],
  ]) {
    const output = await run(args);
    assert.equal(output.status, 1);
    assert.match(
      output.stderr,
      /unknown option|too many arguments|argument missing/,
    );
  }
});

test("legacy recovery commands remain hidden aliases with a deprecation warning", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-legacy-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const [legacy, current] of [
    [
      ["recovery", "verify", "--directory", directory],
      "recovery transfer verify",
    ],
    [["recovery", "registry", "recover"], "recovery registry release"],
  ] as const) {
    const output = await run([...legacy]);
    assert.match(
      output.stderr,
      new RegExp(
        `outpost ${legacy.slice(0, 2).join(" ")}.* is deprecated; use outpost ${current}`,
      ),
    );
  }
  const modern = await run([
    "recovery",
    "transfer",
    "verify",
    "--path",
    directory,
  ]);
  assert.doesNotMatch(modern.stderr, /deprecated/);
  assert.equal(modern.status, 1);
});
