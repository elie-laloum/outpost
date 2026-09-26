import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { chmod, stat, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  agent,
  defineHarnessPermissions,
  dispatch,
  harness,
  harnessEditTools,
  harnessFileTools,
  harnessGitTools,
  harnessSearchTools,
  harnessShellTools,
  type CustomHarnessOptions,
  type ModelProvider,
  type ModelRequest,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repository } from "../helpers.ts";

const posixShell = process.platform !== "win32";
type Step = readonly [name: string, input: unknown][];

async function exercise(
  t: TestContext,
  steps: readonly Step[],
  prepare: (root: string) => Promise<void> = async () => undefined,
  extra: Omit<CustomHarnessOptions, "modelProvider"> = {},
): Promise<string[][]> {
  const root = await repository(t);
  await prepare(root);
  const pending = [...steps];
  const outputs: string[][] = [];
  const provider: ModelProvider = {
    name: "scripted",
    async request(request: ModelRequest) {
      const last = request.messages?.at(-1)?.content ?? [];
      if (last.some((block) => block.type === "tool-result"))
        outputs.push(
          last.map((block) =>
            block.type === "tool-result"
              ? `${block.isError ? "error: " : ""}${block.content}`
              : "",
          ),
        );
      const step = pending.shift();
      if (!step) {
        const text = "<outpost>done</outpost>";
        return { text, content: [{ type: "text", text }], stopReason: "end" };
      }
      return {
        text: "",
        content: step.map(([name, input], index) => ({
          type: "tool-call" as const,
          id: `call-${outputs.length}-${index}`,
          name,
          input,
        })),
        stopReason: "tool-calls",
      };
    },
  };
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: "m",
      harness: harness({
        modelProvider: provider,
        tools: [
          harnessFileTools(),
          harnessEditTools(),
          harnessSearchTools(),
          harnessGitTools(),
          ...(posixShell ? [harnessShellTools({ deadlineMs: 5_000 })] : []),
        ],
        ...extra,
      }),
    }),
    brief: { text: "use tools" },
    logging: false,
  });
  assert.equal(result.completed, true);
  return outputs;
}

test("file tools read numbered text and list files Git would track", async (t) => {
  const [first, second] = await exercise(
    t,
    [
      [
        ["read_file", { path: "notes.txt" }],
        ["read_file", { path: "notes.txt", offset: 2, limit: 1 }],
        ["read_file", { path: "empty.txt" }],
        ["read_file", { path: "image.bin" }],
        ["read_file", { path: "missing.txt" }],
        ["read_file", { path: "../outside.txt" }],
      ],
      [
        ["list_files", {}],
        ["list_files", { pattern: "**/*.ts" }],
        ["list_files", { path: "src" }],
        ["list_files", { path: "nothing-here" }],
        ["list_files", { pattern: "*.md" }],
      ],
    ],
    async (root) => {
      await writeFile(join(root, "notes.txt"), "one\r\ntwo\nthree\n");
      await writeFile(join(root, "empty.txt"), "");
      await writeFile(join(root, "image.bin"), Buffer.from([1, 0, 2]));
      await writeFile(join(root, ".gitignore"), "ignored.txt\n");
      await writeFile(join(root, "ignored.txt"), "hidden");
      const { mkdir } = await import("node:fs/promises");
      await mkdir(join(root, "src"));
      await writeFile(join(root, "src", "a.ts"), "export {};\n");
      await git(root, ["add", "."]);
      await git(root, ["commit", "-m", "fixtures"]);
      await writeFile(join(root, "untracked.md"), "draft");
    },
  );
  assert.deepEqual(first?.slice(0, 3), [
    "1\tone\n2\ttwo\n3\tthree",
    "2\ttwo\n[lines 2-2 of 3]",
    "(empty file)",
  ]);
  assert.match(first?.[3] ?? "", /^error: image\.bin looks binary/);
  assert.match(first?.[4] ?? "", /^error: /);
  assert.equal(
    first?.[5],
    "error: Path must stay inside the repository: ../outside.txt",
  );
  const listing = second?.[0]?.split("\n") ?? [];
  assert.ok(listing.includes("untracked.md"));
  assert.ok(listing.includes("src/a.ts"));
  assert.ok(!listing.includes("ignored.txt"));
  assert.equal(second?.[1], "src/a.ts");
  assert.equal(second?.[2], "src/a.ts");
  assert.equal(second?.[3], "No files found.");
  assert.equal(second?.[4], "untracked.md");
});

test("edit tools write, replace exactly and keep file modes and line endings", async (t) => {
  const [writes, edits, checks] = await exercise(
    t,
    [
      [
        [
          "write_file",
          { path: "src/new/file.txt", content: "alpha\r\nbeta\r\n" },
        ],
        ["write_file", { path: "../escape.txt", content: "x" }],
      ],
      [
        [
          "edit_file",
          { path: "src/new/file.txt", old_text: "beta", new_text: "gamma" },
        ],
        [
          "edit_file",
          { path: "script.sh", old_text: "echo", new_text: "printf" },
        ],
        [
          "edit_file",
          { path: "script.sh", old_text: "missing", new_text: "x" },
        ],
        ["edit_file", { path: "repeat.txt", old_text: "a", new_text: "b" }],
        [
          "edit_file",
          {
            path: "repeat.txt",
            old_text: "a",
            new_text: "$&",
            replace_all: true,
          },
        ],
      ],
      [
        ["read_file", { path: "src/new/file.txt" }],
        ["read_file", { path: "repeat.txt" }],
      ],
    ],
    async (root) => {
      await writeFile(join(root, "script.sh"), "#!/bin/sh\necho hi\n");
      await chmod(join(root, "script.sh"), 0o755);
      await writeFile(join(root, "repeat.txt"), "a-a");
    },
  );
  assert.equal(writes?.[0], "Wrote 13 bytes to src/new/file.txt");
  assert.equal(
    writes?.[1],
    "error: Path must stay inside the repository: ../escape.txt",
  );
  assert.deepEqual(edits, [
    "Replaced 1 occurrence(s) in src/new/file.txt",
    "Replaced 1 occurrence(s) in script.sh",
    "error: old_text was not found in script.sh",
    "error: old_text appears 2 times in repeat.txt; add surrounding lines or set replace_all",
    "Replaced 2 occurrence(s) in repeat.txt",
  ]);
  assert.deepEqual(checks, ["1\talpha\n2\tgamma", "1\t$&-$&"]);
});

test(
  "edited files keep their mode inside the sandbox and links are not followed",
  {
    skip: !posixShell,
  },
  async (t) => {
    const outputs = await exercise(
      t,
      [
        [["edit_file", { path: "run.sh", old_text: "one", new_text: "two" }]],
        [
          ["shell", { command: "./run.sh && od -c crlf.txt | head -1" }],
          ["read_file", { path: "link.txt" }],
        ],
      ],
      async (root) => {
        await writeFile(join(root, "run.sh"), "#!/bin/sh\necho one\n");
        await chmod(join(root, "run.sh"), 0o755);
        await writeFile(join(root, "crlf.txt"), "x\r\n");
        await symlink("/etc/hostname", join(root, "link.txt"));
      },
    );
    assert.match(
      outputs[1]?.[0] ?? "",
      /exit status: 0\n--- stdout ---\ntwo\n.*x {2}\\r {2}\\n/s,
    );
    assert.match(outputs[1]?.[1] ?? "", /^error: link\.txt is a symbolic link/);
    assert.ok((await stat(join(process.cwd(), "package.json"))).isFile());
  },
);

test("search and git tools inspect the repository without side effects", async (t) => {
  const [results] = await exercise(
    t,
    [
      [
        ["search", { pattern: "needle" }],
        ["search", { pattern: "NEEDLE", ignore_case: true, glob: "*.md" }],
        ["search", { pattern: "absent-value" }],
        ["search", { pattern: "(", path: "." }],
        ["search", { pattern: "needle", path: "docs", max_results: 1 }],
        ["git", { command: "status", arguments: ["--short"] }],
        ["git", { command: "log", arguments: ["-n", "1", "--format=%s"] }],
        ["git", { command: "diff", arguments: ["--output=/tmp/x"] }],
      ],
    ],
    async (root) => {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(join(root, "docs"));
      await writeFile(join(root, "docs", "a.md"), "needle one\nneedle two\n");
      await writeFile(join(root, "code.ts"), "const needle = 1;\n");
    },
  );
  assert.match(results?.[0] ?? "", /code\.ts:1:const needle = 1;/);
  assert.match(results?.[0] ?? "", /docs\/a\.md:1:needle one/);
  assert.doesNotMatch(results?.[1] ?? "", /code\.ts/);
  assert.match(results?.[1] ?? "", /docs\/a\.md:2:needle two/);
  assert.equal(results?.[2], "No matches.");
  assert.match(results?.[3] ?? "", /^error: /);
  assert.equal(
    results?.[4],
    "docs/a.md:1:needle one\n[1 more matches; refine the search]",
  );
  assert.match(
    results?.[5] ?? "",
    /exit status: 0\n--- stdout ---\n\?\? code\.ts/,
  );
  assert.match(results?.[6] ?? "", /--- stdout ---\nInitial/);
  assert.equal(results?.[7], "error: Unsupported Git option: --output=/tmp/x");
});

test(
  "shell tools report status and output, and permissions see their resources",
  {
    skip: !posixShell,
  },
  async (t) => {
    const [results] = await exercise(
      t,
      [
        [
          ["shell", { command: "echo out; echo err >&2" }],
          ["shell", { command: "exit 3" }],
          ["shell", { command: "rm -rf /" }],
          ["write_file", { path: "docs/blocked.md", content: "x" }],
          ["write_file", { path: "src/ok.md", content: "x" }],
        ],
      ],
      undefined,
      {
        permissions: defineHarnessPermissions({
          rules: [
            { effect: "deny", commands: ["rm *"], reason: "No removal" },
            { effect: "allow", tools: ["write_file"], paths: ["src/**"] },
            { effect: "deny", tools: ["write_file"] },
          ],
        }),
      },
    );
    assert.deepEqual(results, [
      "exit status: 0\n--- stdout ---\nout\n\n--- stderr ---\nerr\n",
      "error: exit status: 3",
      "error: Denied: No removal",
      "error: Denied: Denied by permission rule 3",
      "Wrote 1 bytes to src/ok.md",
    ]);
    assert.throws(() => harnessShellTools({ deadlineMs: 0 }), /deadlineMs/);
  },
);
