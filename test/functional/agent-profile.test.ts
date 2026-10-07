import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  createSandbox,
  defineAgentProfile,
  defineHarnessHook,
  defineHarnessPermissions,
  defineHarnessSubagent,
  type AgentObservation,
  type ModelProvider,
  type ModelRequest,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const results = (request: ModelRequest) =>
  request.messages
    ?.at(-1)
    ?.content.filter((block) => block.type === "tool-result") ?? [];

test(
  "profiles enforce shell command equality after hooks, intersect permissions and persist across warm resumes",
  { skip: process.platform === "win32" },
  async (t) => {
    const root = await repository(t);
    const calls = [
      ["read_file", { path: "base.txt" }],
      ["shell", { command: "printf allowed" }],
      ["shell", { command: "printf allowed; touch forbidden" }],
      ["shell", { command: "printf original" }],
      ["write_file", { path: "blocked.txt", content: "blocked" }],
    ] as const;
    let step = 0;
    const received: string[] = [];
    const events: AgentObservation[] = [];
    const modelProvider: ModelProvider = {
      name: "offline",
      async request(request) {
        assert.ok(
          request.system?.includes("Never modify generated files. ${LITERAL}"),
        );
        for (const result of results(request)) received.push(result.content);
        const call = calls[step++];
        if (!call) return { text: "<outpost>done</outpost>" };
        return {
          text: "",
          content: [
            {
              type: "tool-call",
              id: `call-${step}`,
              name: call[0],
              input: call[1],
            },
          ],
          stopReason: "tool-calls",
        };
      },
    };
    const agent = createAgent({
      model: "offline",
      harness: createHarness({
        modelProvider,
        profile: defineAgentProfile({
          instructions: "Never modify generated files. ${LITERAL}",
          allowedTools: [
            "read",
            "edit",
            "shell:printf allowed",
            "shell:printf original",
          ],
        }),
        tools: [
          createHarnessFileTools(),
          createHarnessEditTools(),
          createHarnessShellTools(),
        ],
        permissions: defineHarnessPermissions({
          rules: [{ effect: "deny", tools: ["write_file"] }],
        }),
        hooks: [
          defineHarnessHook({
            on: "before-tool",
            run(context) {
              if (
                context.call?.name === "shell" &&
                JSON.stringify(context.call.input).includes("original")
              )
                return { input: { command: "touch hook-forbidden" } };
            },
          }),
        ],
      }),
    });
    await using sandbox = await createSandbox({
      repository: root,
      sandboxProvider: createLocalSandboxProvider(),
      logging: false,
    });
    const first = await sandbox.dispatch({
      agent,
      brief: { text: "Use the tools." },
      observe: (event) => events.push(event),
    });
    assert.equal(first.completed, true);
    assert.match(received[0] ?? "", /base/);
    assert.match(received[1] ?? "", /allowed/);
    assert.ok(
      received.slice(2).every((text) => text.includes("Denied:")),
      JSON.stringify(received),
    );
    for (const file of ["forbidden", "hook-forbidden", "blocked.txt"])
      await assert.rejects(stat(join(root, file)), { code: "ENOENT" });
    assert.equal(
      events.filter((event) => event.kind === "tool-denied").length,
      3,
    );
    assert.ok(first.conversation);
    const resumed = await sandbox.dispatch({
      agent,
      continuation: { id: first.conversation },
      brief: { text: "Continue." },
    });
    assert.equal(resumed.completed, true);
    assert.equal(resumed.conversation, first.conversation);
    assert.equal(await readFile(join(root, "base.txt"), "utf8"), "base\n");
  },
);

test("a subagent applies its own portable profile inside the borrowed sandbox", async (t) => {
  const root = await repository(t);
  let childStep = 0;
  const child = createAgent({
    model: "offline",
    harness: createHarness({
      profile: defineAgentProfile({
        allowedTools: ["read"],
        instructions: "Read only.",
      }),
      tools: [createHarnessFileTools(), createHarnessEditTools()],
      modelProvider: {
        name: "child",
        async request(request) {
          assert.ok(request.system?.includes("Read only."));
          if (childStep++ === 0)
            return {
              text: "",
              stopReason: "tool-calls",
              content: [
                {
                  type: "tool-call",
                  id: "write",
                  name: "write_file",
                  input: { path: "child-forbidden", content: "blocked" },
                },
              ],
            };
          assert.equal(results(request)[0]?.isError, true);
          assert.match(results(request)[0]?.content ?? "", /agent profile/);
          return { text: "Refused write." };
        },
      },
    }),
  });
  let parentStep = 0;
  const parent = createAgent({
    model: "offline",
    harness: createHarness({
      tools: [
        defineHarnessSubagent({
          name: "review",
          description: "Review the repository",
          agent: child,
        }),
      ],
      modelProvider: {
        name: "parent",
        async request() {
          if (parentStep++ === 0)
            return {
              text: "",
              stopReason: "tool-calls",
              content: [
                {
                  type: "tool-call",
                  id: "delegate",
                  name: "review",
                  input: { prompt: "Try writing." },
                },
              ],
            };
          return { text: "<outpost>done</outpost>" };
        },
      },
    }),
  });
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  assert.equal(
    (await sandbox.dispatch({ agent: parent, brief: { text: "Review." } }))
      .completed,
    true,
  );
  await assert.rejects(stat(join(root, "child-forbidden")), { code: "ENOENT" });
});
