import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { PassThrough, Readable } from "node:stream";
import {
  createSandbox,
  dispatch,
  openWorkspace,
  attach,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { git } from "../../src/infrastructure/git.ts";
import { restoreTerminal } from "../../src/infrastructure/terminal.ts";
import { repository, scripted, emit } from "../helpers.ts";

test("cold passes acquire distinct sandboxes while warm dispatch keeps its lease", async (t) => {
  const root = await repository(t),
    base = localSandboxProvider();
  let acquired = 0,
    released = 0;
  const sandboxProvider = {
    ...base,
    async acquire(context: Parameters<typeof base.acquire>[0]) {
      acquired++;
      const lease = await base.acquire(context);
      return {
        ...lease,
        async release() {
          released++;
          await lease.release();
        },
      };
    },
  };
  await dispatch({
    repository: root,
    sandboxProvider,
    agent: scripted(emit("continue")),
    brief: { text: "go" },
    passes: 2,
    logging: false,
  });
  assert.equal(acquired, 2);
  assert.equal(released, 2);
  const box = await createSandbox({
    repository: root,
    sandboxProvider,
    agent: scripted(emit("continue")),
    logging: false,
  });
  await box.dispatch({ brief: { text: "go" }, passes: 2 });
  assert.equal(acquired, 3);
  await box.close();
  assert.equal(released, 3);
});

test("workspace hooks run immediately once and sandbox hooks start concurrently", async (t) => {
  const root = await repository(t);
  const workspace = await openWorkspace({
    repository: root,
    hooks: {
      workspaceReady: [
        {
          executable: process.execPath,
          arguments: ["-e", "require('fs').appendFileSync('ready.txt','once')"],
        },
      ],
      sandboxReady: [
        {
          executable: process.execPath,
          arguments: [
            "-e",
            "let n=0;const t=setInterval(()=>{if(require('fs').existsSync('parallel.txt')){clearInterval(t);process.exit(0)}if(++n>100)process.exit(2)},10)",
          ],
        },
        {
          executable: process.execPath,
          arguments: [
            "-e",
            "require('fs').writeFileSync('parallel.txt','ready')",
          ],
        },
      ],
    },
  });
  assert.equal(await readFile(join(root, "ready.txt"), "utf8"), "once");
  const box = await workspace.sandbox({
    sandboxProvider: localSandboxProvider(),
  });
  await box.close();
  await workspace.close();
  assert.equal(await readFile(join(root, "ready.txt"), "utf8"), "once");
});

test("failed allocation preserves a clean owned workspace when provider cleanup is uncertain", async (t) => {
  const root = await repository(t);
  const sandboxProvider = {
    ...localSandboxProvider(),
    async acquire() {
      throw new Error("provision failure");
    },
  };
  await assert.rejects(
    createSandbox({
      repository: root,
      sandboxProvider,
      branch: { mode: "named", name: "broken-start" },
    }),
    /provision failure/,
  );
  assert.equal(
    (await git(root, ["worktree", "list", "--porcelain"])).match(/^worktree /gm)
      ?.length,
    2,
  );
});

test("relative prompts resolve from the caller directory even with another repository", async (t) => {
  const root = await repository(t),
    prompt = join(root, "caller.md");
  await writeFile(prompt, "caller prompt");
  const agent = scripted(
    "let text='';for await(const chunk of process.stdin)text+=chunk;console.log(JSON.stringify({kind:'text',text}))",
  );
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    brief: { file: relative(process.cwd(), prompt) },
    logging: false,
  });
  assert.equal(result.text, "caller prompt");
});

test("interactive prompt collection asks once per missing variable and retains supplied values", async (t) => {
  const root = await repository(t),
    prompt = join(root, "prompt.md");
  await writeFile(
    prompt,
    "{{ GIVEN }} {{ MISSING }} {{MISSING}} {{WORK_BRANCH}}",
  );
  const requested: string[] = [];
  const result = await attach({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted((input) => `console.log(${JSON.stringify(input.text)})`),
    brief: { file: prompt, values: { GIVEN: "existing" } },
    ask: async (key) => {
      requested.push(key);
      return "collected";
    },
  });
  assert.deepEqual(requested, ["MISSING"]);
  assert.equal(result.stdout.trim(), "existing collected collected main");
});

test("interactive commands support caller streams and terminal cleanup tolerates disconnects", async () => {
  const stdout = new PassThrough(),
    stderr = new PassThrough();
  let output = "",
    errors = "";
  stdout.on("data", (chunk) => {
    output += chunk;
  });
  stderr.on("data", (chunk) => {
    errors += chunk;
  });
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      "-e",
      "process.stdin.pipe(process.stdout);process.stderr.write('err')",
    ],
    interactive: true,
    terminal: {
      input: Readable.from(["input"]),
      output: stdout,
      error: stderr,
    },
  });
  assert.equal(result.status, 0);
  assert.equal(output, "input");
  assert.equal(errors, "err");
  const modes: boolean[] = [],
    cursor: string[] = [];
  restoreTerminal({
    input: { isTTY: true, setRawMode: (mode) => modes.push(mode) },
    output: { isTTY: true, write: (text) => cursor.push(text) },
  });
  assert.deepEqual(modes, [false]);
  assert.deepEqual(cursor, ["\u001b[?25h"]);
  assert.doesNotThrow(() =>
    restoreTerminal({
      input: {
        isTTY: true,
        setRawMode() {
          throw new Error("gone");
        },
      },
      output: {
        isTTY: true,
        write() {
          throw new Error("gone");
        },
      },
    }),
  );
});

test("plain process exit invokes registered cleanup without replacing the exit status", async () => {
  const module = pathToFileURL(
    join(process.cwd(), "src/infrastructure/shutdown.ts"),
  ).href;
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      "--input-type=module",
      "-e",
      `import {registerCleanup} from ${JSON.stringify(module)};registerCleanup(()=>console.log('cleanup'));process.exit(7)`,
    ],
  });
  assert.equal(result.status, 7);
  assert.equal(result.stdout.trim(), "cleanup");
});

test("reused clean branches fast-forward from origin but preserve local divergence", async (t) => {
  const root = await repository(t),
    upstream = await repository(t);
  await git(root, ["remote", "add", "origin", upstream]);
  await git(upstream, ["branch", "topic"]);
  await git(root, ["fetch", "origin", "topic"]);
  const first = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "topic", from: "origin/topic" },
  });
  await first.close({ preserve: true });
  await git(upstream, ["checkout", "topic"]);
  await writeFile(join(upstream, "remote.txt"), "advance");
  await git(upstream, ["add", "."]);
  await git(upstream, ["commit", "-m", "Advance origin"]);
  const next = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "topic" },
  });
  assert.equal(
    await readFile(join(next.directory, "remote.txt"), "utf8"),
    "advance",
  );
  await writeFile(join(next.directory, "local.txt"), "local");
  await git(next.directory, ["add", "."]);
  await git(next.directory, ["commit", "-m", "Local change"]);
  const localHead = (await git(next.directory, ["rev-parse", "HEAD"])).trim();
  await next.close({ preserve: true });
  await writeFile(join(upstream, "second.txt"), "diverge");
  await git(upstream, ["add", "."]);
  await git(upstream, ["commit", "-m", "Remote change"]);
  const divergent = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "topic" },
  });
  assert.equal(
    (await git(divergent.directory, ["rev-parse", "HEAD"])).trim(),
    localHead,
  );
  await divergent.close();
});

test("managed detached workspaces survive reopening and stale paths are recovered safely", async (t) => {
  const root = await repository(t);
  const first = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "resume-detached" },
    label: "Readable Job",
  });
  assert.match(first.directory, /readable-job/);
  await git(first.directory, ["checkout", "--detach"]);
  await first.close();
  const next = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "resume-detached" },
  });
  assert.equal(next.directory, first.directory);
  await git(next.directory, ["checkout", "resume-detached"]);
  await next.close();
  const orphan = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "orphan" },
  });
  const orphanPath = orphan.directory;
  await orphan.close();
  await mkdir(orphanPath);
  await writeFile(join(orphanPath, "retained.txt"), "do not discard");
  const recovered = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "orphan" },
  });
  const entries = await readdir(join(root, ".outpost/recovery"));
  const saved = entries.find((name) => name.startsWith("orphan-"))!;
  assert.equal(
    await readFile(
      join(root, ".outpost/recovery", saved, "retained.txt"),
      "utf8",
    ),
    "do not discard",
  );
  await recovered.close();
  const stale = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "stale" },
  });
  await stale.close({ preserve: true });
  assert.ok(stale.directory.startsWith(join(root, ".outpost", "workspaces")));
  await rm(stale.directory, { recursive: true, force: true });
  const rebuilt = await openWorkspace({
    repository: root,
    branch: { mode: "named", name: "stale" },
  });
  assert.equal(
    await readFile(join(rebuilt.directory, "base.txt"), "utf8"),
    "base\n",
  );
  await rebuilt.close();
});
