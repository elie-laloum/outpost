import { agent as composeAgent } from "../../src/domain/agent.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  claude,
  codex,
  conversations,
  dispatch,
  attach,
  createSandbox,
  response,
} from "../../src/index.ts";
import type { AgentObservation, ConversationStore } from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import {
  parseEnvironment,
  resolveVariables,
} from "../../src/infrastructure/settings.ts";
import { repository, scripted, emit } from "../helpers.ts";

test("final Claude results are authoritative without duplicating streamed text", async (t) => {
  const root = await repository(t);
  for (const assistant of [false, true]) {
    const lines = [
      ...(assistant
        ? [
            {
              type: "assistant",
              message: { content: [{ type: "text", text: "answer" }] },
            },
          ]
        : []),
      { type: "result", result: "answer", is_error: false },
    ];
    const native = composeAgent({
      harness: claude.harness({ saveConversations: false }),
    });
    const agent = {
      ...native,
      request: () => ({
        executable: process.execPath,
        arguments: [
          "-e",
          `for(const line of ${JSON.stringify(lines)})console.log(JSON.stringify(line))`,
        ],
      }),
    };
    const result = await dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent,
      brief: { text: "test" },
      logging: false,
    });
    assert.equal(result.text, "answer");
  }
});

test("raw lines and normalized events retain pass and timestamp without losing fallback output", async (t) => {
  const root = await repository(t),
    events: AgentObservation[] = [];
  const lines = ["first line", "second line"];
  const agent = {
    kind: "cli" as const,
    harness: {
      kind: "cli" as const,
      bind() {
        throw new Error("Already bound fixture");
      },
    },
    name: "plain",
    request: () => ({
      executable: process.execPath,
      arguments: ["-e", `console.log(${JSON.stringify(lines.join("\n"))})`],
    }),
    events: () => [],
  };
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    brief: { text: "test" },
    logging: false,
    passes: 2,
    observe: (event) => events.push(event),
  });
  assert.equal(result.turns[0]?.text, lines.join("\n") + "\n");
  assert.deepEqual(
    events.filter((event) => event.kind === "raw").map((event) => event.pass),
    [1, 1, 2, 2],
  );
  assert.ok(events.every((event) => Number.isFinite(Date.parse(event.at))));
});

test("project environment is an allowlist with file precedence and empty-value inheritance", async (t) => {
  const root = await repository(t);
  await mkdir(join(root, ".outpost"));
  await writeFile(join(root, ".env"), "ROOT_SECRET=hidden\n");
  await writeFile(
    join(root, ".outpost", ".env"),
    "TOKEN=file\nINHERITED=\nEMPTY=\n",
  );
  assert.deepEqual(
    await resolveVariables(
      root,
      {},
      {},
      { TOKEN: "process", INHERITED: "passed", OPENAI_API_KEY: "hidden" },
    ),
    { TOKEN: "file", INHERITED: "passed", EMPTY: "" },
  );
  assert.deepEqual(
    parseEnvironment('TAB="a\\tb"\nSLASH="a\\\\nb"\nLITERAL=\'a\\tb\'\n'),
    { TAB: "a\tb", SLASH: "a\\nb", LITERAL: "a\\tb" },
  );
});

test("JSON responses accept Markdown fences while preserving JSON string escapes", async () => {
  const spec = response.json({ tag: "payload", schema: (value) => value });
  for (const language of ["json", ""]) {
    const expected = { code: "```", path: "a\\nb" };
    assert.deepEqual(
      await spec.read(
        `<payload>\`\`\`${language}\n${JSON.stringify(expected)}\n\`\`\`</payload>`,
      ),
      expected,
    );
  }
  await assert.rejects(
    spec.read("<payload>```json\ninvalid\n```</payload>"),
    /Invalid/,
  );
});

test("conversation rewriting preserves unrelated cwd fields and untouched JSONL bytes", () => {
  const untouched = '{ "cwd": "/different", "value": 1 }';
  const changed = JSON.stringify({
    cwd: "/origin",
    nested: { cwd: "/origin/sub" },
    content: "/origin",
  });
  const result = conversations
    .rewrite(
      changed + "\n" + untouched + "\ninvalid\n",
      "/destination",
      "/origin",
    )
    .split("\n");
  assert.deepEqual(JSON.parse(result[0]!), {
    cwd: "/destination",
    nested: { cwd: "/origin/sub" },
    content: "/origin",
  });
  assert.equal(result[1], untouched);
  assert.equal(result[2], "invalid");
});

test("Claude transcript usage retains four independent counters from the last assistant", () => {
  const content =
    [
      { type: "assistant", message: { usage: { input_tokens: 9 } } },
      {
        type: "assistant",
        message: {
          usage: {
            input_tokens: 2,
            cache_creation_input_tokens: 3,
            cache_read_input_tokens: 4,
            output_tokens: 5,
          },
        },
      },
    ]
      .map((item) => JSON.stringify(item))
      .join("\n") + "\ninvalid";
  assert.deepEqual(
    composeAgent({ harness: claude.harness({}) }).transcriptUsage?.(content),
    {
      input: 2,
      cacheCreated: 3,
      cached: 4,
      output: 5,
    },
  );
  assert.equal(
    composeAgent({ harness: claude.harness({}) }).transcriptUsage?.("invalid"),
    undefined,
  );
  assert.equal(
    composeAgent({ harness: codex.harness({}) }).events(
      JSON.stringify({ type: "error", error: "native failure" }),
    )[0]?.kind,
    "failure",
  );
});

test("already cancelled operations preserve the exact reason without touching a repository", async () => {
  let acquired = 0;
  const sandboxProvider = {
    ...localSandboxProvider(),
    acquire: async () => {
      acquired++;
      throw new Error("unreachable");
    },
  };
  const reason = new Error("stop before setup"),
    signal = AbortSignal.abort(reason);
  for (const operation of [dispatch, attach])
    await assert.rejects(
      operation({
        repository: "nonexistent-audit-path",
        agent: scripted(emit("ok")),
        sandboxProvider,
        brief: { text: "go" },
        signal,
      }),
      (error) => error === reason,
    );
  await assert.rejects(
    createSandbox({
      repository: "nonexistent-audit-path",
      sandboxProvider,
      signal,
    }),
    (error) => error === reason,
  );
  assert.equal(acquired, 0);
});

test("structured output preflight rejects missing tags and unsupported repairs before provisioning", async (t) => {
  const root = await repository(t);
  let acquired = 0;
  const sandboxProvider = {
    ...localSandboxProvider(),
    acquire: async () => {
      acquired++;
      throw new Error("unreachable");
    },
  };
  const agent = { ...scripted(emit("ok")), resumable: false };
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider,
      agent,
      brief: { text: "no tag" },
      response: response.text({ tag: "answer" }),
    }),
    /opening/,
  );
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider,
      agent,
      brief: { text: "<answer>" },
      response: response.text({ tag: "answer", repairs: 1 }),
    }),
    /continuation/,
  );
  assert.equal(acquired, 0);
});

test("journals append complete runs and include raw recognized agent output when verbose", async (t) => {
  const root = await repository(t),
    file = join(root, "combined.jsonl");
  for (let run = 0; run < 2; run++)
    await dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: scripted(emit("ok")),
      brief: { text: "go" },
      logging: { file, verbose: true },
    });
  const records = (await readFile(file, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(
    records.filter((record) => record.kind === "dispatch-start").length,
    2,
  );
  assert.equal(records.filter((record) => record.kind === "raw").length, 2);
  assert.equal(records.filter((record) => record.kind === "text").length, 2);
});

test("the default completion marker stops later passes without an explicit until option", async (t) => {
  const root = await repository(t);
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(emit("<outpost>done</outpost>")),
    brief: { text: "go" },
    passes: 3,
    logging: false,
  });
  assert.equal(result.completed, true);
  assert.equal(result.turns.length, 1);
});

test("custom conversation storage supports cold continuation and per-turn transcript exposure", async (t) => {
  const root = await repository(t),
    file = join(root, "native.jsonl");
  let captures = 0,
    lookups = 0;
  const storage: ConversationStore = {
    name: "custom-native",
    async locate(id) {
      lookups++;
      await readFile(file);
      return { id, file, format: "custom" };
    },
    async capture(id) {
      captures++;
      await writeFile(file, "native data");
      return { id, file, format: "custom" };
    },
    async restore() {},
  };
  const agent = {
    ...scripted(
      `console.log(JSON.stringify({kind:'conversation',id:'custom-id'}));${emit("ok")}`,
    ),
    storage,
  };
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    brief: { text: "go" },
    logging: false,
  });
  assert.equal(result.turns[0]?.transcript, file);
  await result.resume({ brief: { text: "again" } });
  assert.equal(captures, 2);
  assert.ok(lookups >= 1);
});
