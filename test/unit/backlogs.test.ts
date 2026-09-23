import { test } from "node:test";
import assert from "node:assert/strict";
import { githubBacklog, beadsBacklog } from "../../src/index.ts";
import { readPlan } from "../../src/domain/backlog.ts";
import type { Command } from "../../src/domain/ports.ts";

test("GitHub backlog paginates, filters pull requests and preserves label and issue lifecycle arguments", async () => {
  const calls: Command[] = [];
  const backlog = githubBacklog(
    { label: "ready & tested" },
    async (command) => {
      calls.push(command);
      const args = command.arguments!;
      return {
        status: 0,
        stderr: "",
        stdout:
          args[0] === "api"
            ? JSON.stringify([
                [
                  { number: 1, title: "One", body: null },
                  { number: 2, title: "PR", pull_request: {} },
                ],
                [{ number: 3, title: "Three", body: "details" }],
              ])
            : args[1] === "view"
              ? '{"number":3,"title":"Three","body":"details"}'
              : "",
      };
    },
  );
  assert.deepEqual(
    (await backlog.list()).map((issue) => issue.id),
    ["1", "3"],
  );
  assert.match(calls[0]!.arguments![1]!, /labels=ready%20%26%20tested/);
  assert.deepEqual(calls[0]!.arguments!.slice(-2), ["--paginate", "--slurp"]);
  assert.equal((await backlog.get("3")).body, "details");
  await backlog.close("3");
  assert.deepEqual(calls.at(-1)?.arguments, [
    "issue",
    "close",
    "3",
    "--reason",
    "completed",
  ]);
  await assert.rejects(backlog.get("--help"), /positive number/);
  await assert.rejects(backlog.close("0"), /positive number/);
  const stop = AbortSignal.abort(new Error("cancel tracker"));
  await assert.rejects(backlog.list(stop), (error) => error === stop.reason);
});

test("Beads maps ready and detail shapes and propagates CLI errors", async () => {
  const calls: Command[] = [];
  const backlog = beadsBacklog({ label: "ready" }, async (command) => {
    calls.push(command);
    return {
      status: 0,
      stdout: '[{"id":"bd-1","title":"One","description":"Body"}]',
      stderr: "",
    };
  });
  assert.equal((await backlog.list())[0]?.body, "Body");
  assert.deepEqual(calls[0]?.arguments, [
    "ready",
    "--json",
    "--limit",
    "0",
    "--label",
    "ready",
  ]);
  assert.equal((await backlog.get("bd-1")).id, "bd-1");
  await backlog.close("bd-1");
  assert.deepEqual(calls.at(-1)?.arguments, ["close", "bd-1"]);
  await assert.rejects(backlog.get("../bad"), /Invalid Beads/);
  await assert.rejects(
    beadsBacklog({}, async () => ({
      status: 1,
      stdout: "",
      stderr: "unavailable",
    })).list(),
    /status 1/,
  );
  await assert.rejects(
    githubBacklog({}, async () => ({
      status: 0,
      stdout: "{}",
      stderr: "",
    })).list(),
    /Invalid GitHub/,
  );
  await assert.rejects(
    beadsBacklog({}, async () => ({
      status: 0,
      stdout: "{}",
      stderr: "",
    })).list(),
    /Invalid Beads/,
  );
});

test("plans reject malformed rows and duplicate issue or branch assignments", () => {
  for (const input of [
    null,
    {},
    { issues: "no" },
    { issues: [null] },
    { issues: [{ id: "", branch: "outpost/a" }] },
    { issues: [{ id: "1", branch: "main" }] },
    {
      issues: [
        { id: "1", branch: "outpost/a" },
        { id: "1", branch: "outpost/b" },
      ],
    },
    {
      issues: [
        { id: "1", branch: "outpost/a" },
        { id: "2", branch: "outpost/a" },
      ],
    },
  ])
    assert.throws(() => readPlan(input));
  assert.deepEqual(readPlan({ issues: [] }), []);
});
