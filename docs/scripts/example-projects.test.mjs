import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtemp,
  readFile,
  writeFile,
  rm,
  symlink,
  mkdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { gunzipSync } from "node:zlib";
import {
  downloadableExamples,
  exampleProject,
  projectArchive,
} from "./example-projects.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));
async function temporary(t) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-guide-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(join(directory, "package.json"), '{"type":"module"}');
  return directory;
}
async function snippet(slug, name, locale = "") {
  const source = await readFile(
    new URL(`../src/content/docs/${locale}guide/${slug}.md`, import.meta.url),
    "utf8",
  );
  const block = [
    ...source.matchAll(/^```ts title="([^"\n]+)"\n([\s\S]*?)^```/gm),
  ].find((match) => match[1] === name);
  assert.ok(block, `${slug}/${name}`);
  return block[2];
}

test("downloaded projects contain all relative imports and round-trip through a tar archive", async () => {
  for (const locale of ["", "fr/"])
    for (const slug of downloadableExamples) {
      const files = await exampleProject(slug, locale);
      const tar = gunzipSync(projectArchive(files));
      const restored = new Map();
      for (let offset = 0; tar[offset];) {
        const header = tar.subarray(offset, offset + 512);
        const name = header.subarray(0, 100).toString().replace(/\0.*$/s, "");
        const size = parseInt(header.subarray(124, 136).toString(), 8);
        restored.set(
          name,
          tar.subarray(offset + 512, offset + 512 + size).toString(),
        );
        offset += 512 + Math.ceil(size / 512) * 512;
      }
      assert.deepEqual(restored, files, `${locale}${slug}`);
    }
  assert.throws(
    () => projectArchive(new Map([["../escape", "bad"]])),
    /Unsafe/,
  );
});

test("the published Git parser handles spaces, Unicode and renamed paths", async (t) => {
  const directory = await temporary(t);
  const git = (...args) => execFileSync("git", ["-C", directory, ...args]);
  git("init");
  git("config", "user.name", "Guide test");
  git("config", "user.email", "test@example.invalid");
  await mkdir(join(directory, "test"));
  await writeFile(join(directory, "test/old.test.ts"), "old\n");
  git("add", "test");
  git("commit", "-m", "Initial");
  git("mv", "test/old.test.ts", "test/new name.test.ts");
  for (const name of ["a b.test.ts", "été.test.ts"])
    await writeFile(join(directory, "test", name), "test\n");
  await writeFile(
    join(directory, "git.ts"),
    await snippet("prepare-change-tests", "git.ts"),
  );
  await writeFile(
    join(directory, "commands.ts"),
    `import { execFileSync } from "node:child_process";
export async function run(context, executable, ...args) {
  return { status: 0, stderr: "", stdout: execFileSync(executable, ["-C", context.repository, ...args], { encoding: "utf8" }) };
}`,
  );
  const { changedFiles } = await import(
    pathToFileURL(join(directory, "git.ts"))
  );
  const files = await changedFiles({ repository: directory });
  assert.deepEqual(
    files.filter((name) => name.startsWith("test/")).sort(),
    [
      "test/a b.test.ts",
      "test/new name.test.ts",
      "test/old.test.ts",
      "test/été.test.ts",
    ].sort(),
  );
});

test("the published portable example saves and restores files across processes", async (t) => {
  const directory = await temporary(t);
  await mkdir(join(directory, "node_modules/@elie-laloum"), {
    recursive: true,
  });
  await symlink(
    repository,
    join(directory, "node_modules/@elie-laloum/outpost"),
    "junction",
  );
  for (const name of [
    "portable-workspace.ts",
    "save-files.ts",
    "restore-files.ts",
  ])
    await writeFile(
      join(directory, name),
      await snippet("resuming-file-workspaces", name),
    );
  execFileSync(process.execPath, ["save-files.ts"], { cwd: directory });
  const output = execFileSync(process.execPath, ["restore-files.ts"], {
    cwd: directory,
    encoding: "utf8",
  });
  assert.match(output, /Ready for review/);
  assert.match(output, /\.outpost-restored/);
});

test("reading and replaying saved journals never import the recording entry point", async (t) => {
  for (const [slug, record, reader, names] of [
    ["journals", "record-journal.ts", "read-journal.ts", []],
    ["record-replay", "record.ts", "replay.ts", ["record-settings.ts"]],
  ]) {
    const directory = await temporary(t);
    await mkdir(join(directory, "node_modules/@elie-laloum"), {
      recursive: true,
    });
    await symlink(
      repository,
      join(directory, "node_modules/@elie-laloum/outpost"),
      "junction",
    );
    const git = (...args) => execFileSync("git", ["-C", directory, ...args]);
    git("init", "-b", "main");
    git("config", "user.name", "Guide test");
    git("config", "user.email", "test@example.invalid");
    git("commit", "--allow-empty", "-m", "Initial");
    await writeFile(
      join(directory, "outpost.config.ts"),
      `
import { scriptedAgent, createMemorySandboxProvider } from "@elie-laloum/outpost/testing";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
export const repository = ${JSON.stringify(directory)};
export const sandboxProvider = createMemorySandboxProvider();
export const coder = scriptedAgent({ turns: [{ text: "Recorded answer" }] });
`,
    );
    for (const name of [record, reader, ...names]) {
      const marker =
        name === record
          ? 'import { appendFileSync } from "node:fs";\nappendFileSync("record-runs.log", "recorded\\n");\n'
          : "";
      await writeFile(
        join(directory, name),
        marker + (await snippet(slug, name)),
      );
    }
    execFileSync(process.execPath, [record], { cwd: directory });
    if (slug === "record-replay") {
      const config = join(directory, "outpost.config.ts");
      await writeFile(
        config,
        (await readFile(config, "utf8")).replace(
          "= createMemorySandboxProvider()",
          "= createLocalSandboxProvider()",
        ),
      );
    }
    execFileSync(process.execPath, [reader], { cwd: directory });
    assert.equal(
      await readFile(join(directory, "record-runs.log"), "utf8"),
      "recorded\n",
      slug,
    );
  }
});

test("the published webhook probe accepts a signed request and refuses a bad signature", async (t) => {
  const directory = await temporary(t);
  await mkdir(join(directory, "node_modules/@elie-laloum"), {
    recursive: true,
  });
  await symlink(
    repository,
    join(directory, "node_modules/@elie-laloum/outpost"),
    "junction",
  );
  const previous = process.env.GITHUB_WEBHOOK_SECRET;
  process.env.GITHUB_WEBHOOK_SECRET = "local-guide-test-secret";
  t.after(() => {
    if (previous === undefined) delete process.env.GITHUB_WEBHOOK_SECRET;
    else process.env.GITHUB_WEBHOOK_SECRET = previous;
  });
  for (const name of [
    "label-job.ts",
    "github-route.ts",
    "server.ts",
    "send-webhook.ts",
  ]) {
    let code = await snippet("webhooks", name);
    if (name === "server.ts")
      code = code
        .replace("port: 8787", "port: 0")
        .replace(
          '".outpost/jobs.sqlite"',
          JSON.stringify(join(directory, "jobs.sqlite")),
        );
    await writeFile(join(directory, name), code);
  }
  const { server, queue } = await import(
    pathToFileURL(join(directory, "server.ts"))
  );
  t.after(async () => {
    await server.close();
    queue.close();
  });
  const result = await promisify(execFile)(
    process.execPath,
    ["send-webhook.ts"],
    {
      cwd: directory,
      env: { ...process.env, WEBHOOK_URL: server.url },
    },
  );
  assert.equal(result.stdout.trim(), "202\n401");
});
