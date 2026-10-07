import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, readFile, rm, utimes, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { changed, createSandbox, recoveryDetails } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository, scripted, emit } from "../helpers.ts";

const countHook = {
  executable: process.execPath,
  arguments: ["-e", "require('fs').appendFileSync('installed.txt', 'x')"],
};
const noop = { executable: process.execPath, arguments: ["-e", ""] };

test("warm preparation hashes content, watches every file and resets for a new sandbox", async (t) => {
  const root = await repository(t);
  const lock = join(root, "lock");
  await writeFile(lock, "one");
  const options = {
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false as const,
    hooks: {
      sandboxReady: [
        { ...countHook, when: changed(["lock", "other"]) },
        {
          executable: process.execPath,
          arguments: ["-e", "require('fs').appendFileSync('always.txt','x')"],
        },
      ],
    },
    agent: scripted(emit("done")),
  };
  await using box = await createSandbox(options);
  await box.command(noop);
  await box.dispatch({ brief: { text: "go" } });
  await box.attach();
  assert.equal(await readFile(join(root, "installed.txt"), "utf8"), "x");
  await utimes(lock, new Date(), new Date());
  await box.command(noop);
  assert.equal(await readFile(join(root, "installed.txt"), "utf8"), "x");
  await writeFile(lock, "two");
  await box.dispatch({ brief: { text: "go" } });
  await writeFile(join(root, "other"), "new");
  await box.attach();
  await rm(lock);
  await box.command(noop);
  await writeFile(lock, "two");
  await box.command(noop);
  assert.equal(await readFile(join(root, "installed.txt"), "utf8"), "xxxxx");
  assert.equal(await readFile(join(root, "always.txt"), "utf8"), "x");
  await box.close();
  await using fresh = await createSandbox(options);
  assert.equal(await readFile(join(root, "installed.txt"), "utf8"), "xxxxxx");
});

test("conditions run in each hook directory and hostReady remains incremental", async (t) => {
  const root = await repository(t);
  const sub = join(root, "sub");
  await mkdir(sub);
  await writeFile(join(sub, "lock"), "one");
  await using box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    hooks: {
      hostReady: [{ ...countHook, directory: sub, when: changed(["lock"]) }],
      sandboxReady: [{ ...countHook, when: changed(["lock"]) }],
    },
  });
  await writeFile(join(sub, "lock"), "two");
  await box.command(noop);
  assert.equal(await readFile(join(sub, "installed.txt"), "utf8"), "xx");
  assert.equal(await readFile(join(root, "installed.txt"), "utf8"), "x");
});

test("failed warm hook blocks the requested command and retries the same fingerprint", async (t) => {
  const root = await repository(t);
  const lock = join(root, "lock");
  await writeFile(lock, "one");
  await using box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    hooks: {
      sandboxReady: [
        {
          executable: process.execPath,
          arguments: [
            "-e",
            "const fs=require('fs');fs.appendFileSync('attempts','x');if(fs.existsSync('fail'))process.exit(7)",
          ],
          when: changed(["lock"]),
        },
      ],
    },
  });
  await writeFile(lock, "two");
  await writeFile(join(root, "fail"), "");
  await assert.rejects(box.command(countHook), /status 7/);
  await assert.rejects(readFile(join(root, "installed.txt")), {
    code: "ENOENT",
  });
  await rm(join(root, "fail"));
  await box.command(countHook);
  assert.equal(await readFile(join(root, "attempts"), "utf8"), "xxx");
  assert.equal(await readFile(join(root, "installed.txt"), "utf8"), "x");
});

test("cancelled warm hook keeps the sandbox reusable and does not save the fingerprint", async (t) => {
  const root = await repository(t);
  const controller = new AbortController();
  await writeFile(join(root, "lock"), "one");
  await using box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    hooks: {
      sandboxReady: [
        {
          executable: process.execPath,
          arguments: [
            "-e",
            "const fs=require('fs');fs.appendFileSync('attempts','x');if(fs.existsSync('wait')){console.log('waiting');setTimeout(()=>{},10000)}",
          ],
          when: changed(["lock"]),
          observe: (_channel, text) => {
            if (text.includes("waiting")) controller.abort();
          },
        },
      ],
    },
  });
  await writeFile(join(root, "lock"), "two");
  await writeFile(join(root, "wait"), "");
  await assert.rejects(
    box.command({ ...noop, signal: controller.signal }),
    /abort|cancel/i,
  );
  await rm(join(root, "wait"));
  await box.command(noop);
  assert.equal(await readFile(join(root, "attempts"), "utf8"), "xxx");
});

test("unreadable watched directories fail setup instead of silently skipping it", async (t) => {
  const root = await repository(t);
  await mkdir(join(root, "lock"));
  await assert.rejects(
    createSandbox({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      hooks: { sandboxReady: [{ ...countHook, when: changed(["lock"]) }] },
    }),
    /status 1/,
  );
  await assert.rejects(readFile(join(root, "installed.txt")), {
    code: "ENOENT",
  });
});

test("a hook that edits its watched file is checked against the pre-command snapshot", async (t) => {
  const root = await repository(t);
  await writeFile(join(root, "lock"), "one");
  await using box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    hooks: {
      sandboxReady: [
        {
          executable: process.execPath,
          arguments: [
            "-e",
            "const fs=require('fs');fs.appendFileSync('attempts','x');fs.writeFileSync('lock','two')",
          ],
          when: changed(["lock"]),
        },
      ],
    },
  });
  await box.command(noop);
  await box.command(noop);
  assert.equal(await readFile(join(root, "attempts"), "utf8"), "xx");
});

test("timed-out conditional preparation retries in a reusable sandbox", async (t) => {
  const root = await repository(t);
  await writeFile(join(root, "lock"), "one");
  await using box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    hooks: {
      sandboxReady: [
        {
          executable: process.execPath,
          deadlineMs: 2000,
          arguments: [
            "-e",
            "const fs=require('fs');fs.appendFileSync('attempts','x');if(fs.existsSync('wait'))setTimeout(()=>{},10000)",
          ],
          when: changed(["lock"]),
        },
      ],
    },
  });
  await writeFile(join(root, "lock"), "two");
  await writeFile(join(root, "wait"), "");
  await assert.rejects(box.command(noop), /exceeded 2000/);
  await rm(join(root, "wait"));
  await box.command(noop);
  assert.equal(await readFile(join(root, "attempts"), "utf8"), "xxx");
});

test("remote preparation watches sandbox files and preserves failed-hook changes on the host", async (t) => {
  const root = await repository(t);
  await writeFile(join(root, "lock"), "one");
  await git(root, ["add", "lock"]);
  await git(root, ["commit", "-m", "Add lock"]);
  const remote = join(root, ".outpost", "remote-fixture");
  await mkdir(remote, { recursive: true });
  const local = createLocalSandboxProvider();
  await using box = await createSandbox({
    repository: root,
    branch: { mode: "named", name: "incremental-remote" },
    sandboxProvider: {
      name: "remote-fixture",
      placement: "remote",
      acquire: (context) =>
        local.acquire({
          ...context,
          repository: remote,
          directory: remote,
          gitDirectories: [],
        }),
    },
    bootstrap: false,
    logging: false,
    agent: scripted(emit("done")),
    hooks: {
      sandboxReady: [
        {
          executable: process.execPath,
          arguments: [
            "-e",
            "const fs=require('fs');fs.appendFileSync('attempts','x');if(fs.existsSync('fail'))process.exit(7)",
          ],
          when: changed(["lock"]),
        },
      ],
    },
  });
  await writeFile(join(remote, "lock"), "two");
  await writeFile(join(remote, "fail"), "");
  await assert.rejects(box.dispatch({ brief: { text: "go" } }), (error) => {
    assert.match(String(error), /status 7/);
    assert.equal(recoveryDetails(error)?.directory, box.workspace.directory);
    return true;
  });
  assert.equal(
    await readFile(join(box.workspace.directory, "lock"), "utf8"),
    "two",
  );
  assert.equal(
    await readFile(join(box.workspace.directory, "attempts"), "utf8"),
    "xx",
  );
  await rm(join(remote, "fail"));
  await box.dispatch({ brief: { text: "go" } });
  assert.equal(
    await readFile(join(box.workspace.directory, "attempts"), "utf8"),
    "xxx",
  );
});
