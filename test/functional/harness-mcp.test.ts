import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  agent,
  harness,
  defineHarnessPermissions,
  defineHarnessSubagent,
  defineHarnessTool,
  dispatch,
  type AgentObservation,
  type HarnessOptions,
  type McpServers,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
  type SandboxProvider,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const server = fileURLToPath(
  new URL("../fixtures/mcp-server.mjs", import.meta.url),
);
const tokens = { input: 4, cached: 1, output: 2 };
const done: ModelResult = {
  text: "<outpost>done</outpost>",
  content: [{ type: "text", text: "<outpost>done</outpost>" }],
  stopReason: "end",
  usage: tokens,
};
type Reply = (request: ModelRequest) => ModelResult;

const call =
  (...calls: [name: string, input: unknown][]): Reply =>
  (request) => ({
    text: "",
    content: calls.map(([name, input], index) => ({
      type: "tool-call" as const,
      id: `call-${request.messages?.length ?? 0}-${index}`,
      name,
      input,
    })),
    stopReason: "tool-calls",
    usage: tokens,
  });

function provider(replies: Reply[], requests: ModelRequest[] = []) {
  const modelProvider: ModelProvider = {
    name: "fixture",
    async request(request) {
      request.signal?.throwIfAborted();
      requests.push(request);
      const reply = replies.shift();
      assert.ok(reply, "unexpected model request");
      return reply(request);
    },
  };
  return modelProvider;
}

const results = (request: ModelRequest | undefined) =>
  (request?.messages?.at(-1)?.content ?? []).map((block) =>
    block.type === "tool-result"
      ? `${block.isError ? "error:" : ""}${block.content}`
      : "",
  );

function fixture(log: string, extra: Partial<McpServers[string]> = {}) {
  return {
    fixture: {
      command: process.execPath,
      arguments: [server],
      environment: { MCP_LOG: log },
      variables: ["MCP_SECRET"],
      ...extra,
    },
  } as McpServers;
}

async function entries(log: string) {
  return (await readFile(log, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

const run = (
  root: string,
  replies: Reply[],
  options: Omit<HarnessOptions, "modelProvider">,
  requests: ModelRequest[] = [],
  sandboxProvider: SandboxProvider = localSandboxProvider({
    variables: { MCP_SECRET: "fixture-secret" },
  }),
  observe?: (event: AgentObservation) => void,
) =>
  dispatch({
    repository: root,
    sandboxProvider,
    logging: false,
    agent: agent({
      model: "m",
      harness: harness({
        modelProvider: provider(replies, requests),
        ...options,
      }),
    }),
    brief: { text: "Use the MCP server" },
    ...(observe ? { observe } : {}),
  });

test("the built-in harness exposes MCP server tools running inside the sandbox", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const long = `mcp__fixture__${"x".repeat(40)}`;
  await run(
    root,
    [
      (request) => {
        const names = (request.tools ?? []).map((tool) => tool.name);
        assert.deepEqual(names.slice(0, 7), [
          "mcp__fixture__echo",
          "mcp__fixture__fail",
          "mcp__fixture__structured",
          "mcp__fixture__weird_name_tool",
          "mcp__fixture__env",
          "mcp__fixture__slow",
          "mcp__fixture__invalid",
        ]);
        assert.match(names[7]!, /^mcp__fixture__x+_[0-9a-f]{8}$/);
        assert.equal(names[7]!.length, 64);
        assert.ok(names[7]!.startsWith(long));
        const fail = request.tools!.find(
          (tool) => tool.name === "mcp__fixture__fail",
        );
        assert.equal(fail?.description, "Always fails");
        const structured = request.tools!.find(
          (tool) => tool.name === "mcp__fixture__structured",
        );
        assert.equal(structured?.inputSchema.$schema, undefined);
        assert.ok(Array.isArray(structured?.inputSchema.anyOf));
        return call(
          ["mcp__fixture__echo", { text: "hi" }],
          ["mcp__fixture__fail", {}],
          ["mcp__fixture__structured", { a: 1 }],
          ["mcp__fixture__weird_name_tool", {}],
          ["mcp__fixture__env", { name: "MCP_SECRET" }],
          ["mcp__fixture__invalid", {}],
          [names[7]!, {}],
          ["mcp__fixture__echo", "not an object"],
        )(request);
      },
      () => done,
    ],
    {
      mcpServers: fixture(log),
      toolExecution: { concurrency: 1 },
    },
    requests,
    undefined,
    (event) => events.push(event),
  );
  assert.deepEqual(results(requests[1]), [
    [
      "echo:hi",
      "[image omitted: image/png]",
      "[resource file:///doc.md]",
      "inline",
      "[resource file:///b.bin]",
      '{"type":"future","value":1}',
    ].join("\n"),
    "error:nope",
    '{"ok":true}',
    "weird",
    "fixture-secret",
    "error:MCP server fixture returned error -32602: bad arguments",
    "long",
    results(requests[1])[7],
  ]);
  assert.match(results(requests[1])[7]!, /^error:.*Expected an object/);
  const log_ = await entries(log);
  assert.deepEqual(
    log_.filter((entry) => entry.reply).map((entry) => entry.reply),
    [
      { jsonrpc: "2.0", id: "server-ping", result: {} },
      {
        jsonrpc: "2.0",
        id: "server-sampling",
        error: {
          code: -32601,
          message: "Outpost does not support sampling/createMessage",
        },
      },
    ],
  );
  assert.deepEqual(log_.at(-1), { closed: true });
  assert.ok(log_.some((entry) => entry.method === "notifications/initialized"));
  assert.ok(
    !events.some(
      (event) => event.kind === "tool-output" && event.text.includes("jsonrpc"),
    ),
  );
});

test("MCP tool deadlines cancel the request and permissions apply to server tools", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  await run(
    root,
    [
      call(["mcp__fixture__slow", {}], ["mcp__fixture__echo", { text: "x" }]),
      () => done,
    ],
    {
      mcpServers: fixture(log),
      toolExecution: { deadlineMs: 100 },
      permissions: defineHarnessPermissions({
        rules: [{ effect: "deny", tools: ["mcp__fixture__echo"] }],
        default: "allow",
      }),
    },
    requests,
    undefined,
    (event) => events.push(event),
  );
  const [slow] = results(requests[1]);
  assert.match(slow!, /^error:.*timed out/);
  assert.ok(events.some((event) => event.kind === "tool-denied"));
  const cancelled = (await entries(log)).find(
    (entry) => entry.method === "notifications/cancelled",
  );
  assert.equal(typeof cancelled?.params.requestId, "number");
});

test("MCP server startup failures stop the turn with a clear cause", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  await assert.rejects(
    run(root, [], {
      mcpServers: fixture(log, { variables: ["MCP_ABSENT"] }),
    }),
    {
      code: "configuration",
      message: /Missing MCP_ABSENT for MCP server fixture/,
    },
  );
  await assert.rejects(
    run(root, [], {
      mcpServers: fixture(log, { arguments: [server, "crash"] }),
    }),
    {
      code: "process",
      message: /MCP server fixture exited with status 3: boom/,
    },
  );
  await assert.rejects(
    run(root, [], {
      mcpServers: fixture(log, { command: "outpost-missing-mcp-command" }),
    }),
    { code: "process", message: /status 127/ },
  );
  const clash = defineHarnessTool({
    name: "mcp__fixture__echo",
    description: "Static tool with an MCP name",
    input: { type: "object" },
    execute: () => "static",
  });
  await assert.rejects(
    run(root, [], { mcpServers: fixture(log), tools: [clash] }),
    {
      code: "configuration",
      message: /Duplicate tool name: mcp__fixture__echo/,
    },
  );
  const streamless: SandboxProvider = {
    ...localSandboxProvider(),
    async acquire(context) {
      const { liveInput: _live, ...lease } =
        await localSandboxProvider().acquire(context);
      return lease;
    },
  };
  await assert.rejects(
    run(root, [], { mcpServers: fixture(log) }, [], streamless),
    { code: "configuration", message: /live process input/ },
  );
});

test("subagents start their own MCP servers on the borrowed sandbox", async (t) => {
  const root = await repository(t);
  const log = join(root, "mcp.log");
  const childRequests: ModelRequest[] = [];
  const child = defineHarnessSubagent({
    name: "inspect",
    description: "Inspect with MCP",
    agent: agent({
      model: "child",
      harness: harness({
        modelProvider: provider(
          [call(["mcp__fixture__env", { name: "MCP_SECRET" }]), () => done],
          childRequests,
        ),
        mcpServers: fixture(log),
      }),
    }),
  });
  const requests: ModelRequest[] = [];
  await run(
    root,
    [
      (request) => {
        assert.ok(
          !(request.tools ?? []).some((tool) => tool.name.startsWith("mcp__")),
        );
        return call(["inspect", { prompt: "go" }])(request);
      },
      () => done,
    ],
    { tools: [child] },
    requests,
  );
  assert.deepEqual(results(childRequests[1]), ["fixture-secret"]);
  assert.deepEqual((await entries(log)).at(-1), { closed: true });
});
