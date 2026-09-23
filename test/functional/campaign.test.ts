import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { campaign, type Backlog, type Issue } from "../../src/index.ts";
import { local } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { initialize } from "../../src/cli/scaffold.ts";
import { emit, repository, scripted } from "../helpers.ts";

const commitFile = (name: string) =>
  `import {writeFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process'; writeFileSync(${JSON.stringify(name)}, 'implemented'); execFileSync('git',['add',${JSON.stringify(name)}]); execFileSync('git',['commit','-m',${JSON.stringify(name)}]);`;

test("campaign refreshes the backlog, isolates failure, shares review sandboxes and closes only after merge", async (t) => {
  const root = await repository(t);
  let lists = 0,
    active = 0,
    peak = 0;
  const closed: string[] = [],
    invocations: { id: string; phase: string; root: string }[] = [];
  const issues: Issue[] = [
    { id: "a", title: "Alpha" },
    { id: "b", title: "Broken" },
    { id: "c", title: "Charlie", blockedBy: ["a"] },
  ];
  const backlog: Backlog = {
    async list() {
      lists++;
      return lists === 1 ? issues : lists === 2 ? [issues[2]!] : [];
    },
    async get(id) {
      return issues.find((issue) => issue.id === id)!;
    },
    async close(id) {
      assert.equal(
        await readFile(join(root, `${id}.txt`), "utf8"),
        "implemented",
      );
      closed.push(id);
    },
  };
  const adapter = scripted((input) => {
    const text = input.text!;
    if (text.startsWith("Select independent")) {
      const ready = JSON.parse(text.split("\n").at(-1)!) as Issue[];
      const prefix = text.match(/outpost\/batch-[\w]+/)![0];
      return emit(
        `<assignments>${JSON.stringify({ issues: ready.map((issue) => ({ id: issue.id, branch: `${prefix}-${issue.id}` })) })}</assignments>`,
      );
    }
    if (text.startsWith("Implement issue b:")) return "process.exit(1)";
    if (text.startsWith("Implement issue")) {
      const id = text.match(/issue (\w+):/)![1];
      return `${commitFile(`${id}.txt`)} await new Promise(r=>setTimeout(r,100)); ${emit("<outpost>done</outpost>")}`;
    }
    if (text.startsWith("Review"))
      assert.match(text, /git diff [0-9a-f]{40}\.\.\.HEAD/);
    return emit("<outpost>done</outpost>");
  });
  const host = local();
  const provider = {
    ...host,
    async acquire(context: Parameters<typeof host.acquire>[0]) {
      const lease = await host.acquire(context);
      return {
        ...lease,
        async invoke(command: Parameters<typeof lease.invoke>[0]) {
          if (
            command.stdin?.startsWith("Implement") ||
            command.stdin?.startsWith("Review")
          ) {
            invocations.push({
              id: command.stdin.match(/issue (\w+)/)![1]!,
              phase: command.stdin.split(" ")[0]!,
              root: lease.root,
            });
            active++;
            peak = Math.max(peak, active);
            try {
              return await lease.invoke(command);
            } finally {
              active--;
            }
          }
          return lease.invoke(command);
        },
      };
    },
  };
  const result = await campaign({
    repository: root,
    agent: adapter,
    provider,
    backlog,
    concurrency: 2,
    implementationPasses: 1,
  });
  assert.equal(result.reason, "empty");
  assert.deepEqual(closed, ["a", "c"]);
  assert.equal(lists, 3);
  assert.equal(
    result.issues.find((issue) => issue.id === "b")?.state,
    "failed",
  );
  for (const id of closed) {
    const phases = invocations.filter((item) => item.id === id);
    assert.deepEqual(
      phases.map((item) => item.phase),
      ["Implement", "Review"],
    );
    assert.equal(phases[0]?.root, phases[1]?.root);
  }
  assert.ok(peak <= 2);
});

test("campaign stops without review, merge or closure when implementation makes no commits", async (t) => {
  const root = await repository(t),
    phases: string[] = [];
  const issue = { id: "1", title: "Nothing to change" };
  let calls = 0;
  const result = await campaign({
    repository: root,
    provider: local(),
    agent: scripted(() => {
      calls++;
      return emit("<outpost>done</outpost>");
    }),
    planner: false,
    backlog: {
      async list() {
        return [issue];
      },
      async get() {
        return issue;
      },
      async close() {
        assert.fail("must not close");
      },
    },
    observe: (event) => phases.push(event.phase),
  });
  assert.equal(result.reason, "no-progress");
  assert.equal(calls, 1);
  assert.deepEqual(phases, ["backlog", "implement"]);
});

test("campaign validates plan ids, duplicate assignments and dependencies before implementation", async (t) => {
  const root = await repository(t),
    issue = { id: "1", title: "Open" };
  const backlog = {
    async list() {
      return [issue];
    },
    async get() {
      assert.fail("invalid plan must not fetch an issue");
    },
    async close() {
      assert.fail("invalid plan must not close");
    },
  };
  await assert.rejects(
    campaign({
      repository: root,
      provider: local(),
      backlog,
      agent: scripted(
        emit(
          '<assignments>{"issues":[{"id":"missing","branch":"outpost/missing"}]}</assignments>',
        ),
      ),
    }),
    /unavailable/,
  );
  const blocked = await campaign({
    repository: root,
    provider: local(),
    agent: scripted("process.exit(1)"),
    backlog: {
      ...backlog,
      async list() {
        return [{ ...issue, blockedBy: ["1"] }];
      },
    },
  });
  assert.equal(blocked.reason, "blocked");
});

test("a failed merge leaves the issue open and its commits available for recovery", async (t) => {
  const root = await repository(t),
    issue = { id: "1", title: "Feature" };
  const agent = scripted((input) =>
    input.text!.startsWith("Implement")
      ? commitFile("feature.txt") + emit("<outpost>done</outpost>")
      : "process.exit(1)",
  );
  await assert.rejects(
    campaign({
      repository: root,
      provider: local(),
      agent,
      planner: false,
      reviewer: false,
      backlog: {
        async list() {
          return [issue];
        },
        async get() {
          return issue;
        },
        async close() {
          assert.fail("failed integration must not close");
        },
      },
    }),
  );
  await assert.rejects(readFile(join(root, "feature.txt")));
  assert.match(await git(root, ["log", "--all", "--format=%s"]), /feature.txt/);
});

test("generated sequential starter executes the campaign with the packaged API contract", async (t) => {
  const root = await repository(t);
  await initialize({
    directory: root,
    provider: "local",
    template: "review",
    agent: "codex",
  });
  const bridge = join(root, ".outpost", "bridge.mts");
  const source = new URL("../../src/index.ts", import.meta.url).href;
  const helper = new URL("../helpers.ts", import.meta.url).href;
  await writeFile(
    bridge,
    `export { campaign, dispatch } from ${JSON.stringify(source)}; export type { Backlog } from ${JSON.stringify(source)}; import {scripted} from ${JSON.stringify(helper)}; export const codex = () => scripted(input => input.text.startsWith('Implement') ? ${JSON.stringify(commitFile("generated.txt") + emit("<outpost>done</outpost>"))} : ${JSON.stringify(emit("<outpost>done</outpost>"))});`,
  );
  const runner = join(root, ".outpost", "run.mts");
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
    directory: root,
  });
  assert.equal(output.status, 0, output.stderr);
  assert.equal(
    await readFile(join(root, "generated.txt"), "utf8"),
    "implemented",
  );
  assert.match(output.stdout, /reason: 'empty'/);
});
