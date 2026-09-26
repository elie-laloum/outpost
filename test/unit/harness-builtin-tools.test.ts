import assert from "node:assert/strict";
import { test } from "node:test";
import { writeFile } from "node:fs/promises";
import {
  harnessEditTools,
  harnessFileTools,
  type HarnessToolContext,
  type SandboxLease,
} from "../../src/index.ts";
import { commandOutput } from "../../src/adapters/tools/sandbox-files.ts";
import { TOOL_LIMITS } from "../../src/adapters/tools/tools.constants.ts";

function context(files: (string | Buffer)[], uploads: string[] = []) {
  const sandbox: SandboxLease = {
    root: "/workspace",
    home: "/home/agent",
    async invoke() {
      throw new Error("unexpected command");
    },
    async download(source, destination) {
      assert.match(source, /^\/workspace\//);
      const next = files.shift();
      assert.ok(next !== undefined, "unexpected download");
      await writeFile(destination, next);
    },
    async upload(_source, destination) {
      uploads.push(destination);
    },
    async release() {},
  };
  return {
    sandbox,
    signal: new AbortController().signal,
    callId: "call",
    model: { name: "m" },
    observe() {},
  } satisfies HarnessToolContext;
}

const tool = (name: string) =>
  [...harnessFileTools().tools, ...harnessEditTools().tools].find(
    (candidate) => candidate.name === name,
  )!;

test("edit_file refuses to overwrite a file changed during the edit", async () => {
  const uploads: string[] = [];
  const result = await tool("edit_file").execute(
    { path: "a.txt", old_text: "old", new_text: "new" },
    context(["old text", "someone else"], uploads),
  );
  assert.deepEqual(result, {
    content: "a.txt changed during the edit; read it again and retry",
    isError: true,
  });
  assert.deepEqual(uploads, []);
  const saved: string[] = [];
  assert.equal(
    await tool("edit_file").execute(
      { path: "dir/../a.txt", old_text: "old", new_text: "new" },
      context(["old text", "old text"], saved),
    ),
    "Replaced 1 occurrence(s) in dir/../a.txt",
  );
  assert.deepEqual(saved, ["/workspace/a.txt"]);
});

test("file limits and command truncation are reported", async () => {
  await assert.rejects(
    Promise.resolve(
      tool("read_file").execute(
        { path: "big.txt" },
        context([Buffer.alloc(TOOL_LIMITS.fileBytes + 1, 97)]),
      ),
    ),
    /has \d+ bytes; the limit is/,
  );
  const long = "x".repeat(TOOL_LIMITS.commandCharacters);
  assert.match(
    commandOutput({ status: 0, stdout: long, stderr: "" }),
    /^exit status: 0\n--- stdout ---\n\[output truncated to the last 200000 characters\]/,
  );
  assert.equal(
    commandOutput({ status: 1, stdout: "", stderr: "" }),
    "exit status: 1",
  );
  assert.deepEqual(tool("read_file").resources({ path: "src/a.ts" }), {
    paths: ["src/a.ts"],
  });
});
