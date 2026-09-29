import assert from "node:assert/strict";
import { test } from "node:test";
import { harness } from "../../src/domain/harness.ts";
import { mcpConnection } from "../../src/adapters/tools/mcp-connection.ts";
import {
  mcpTools,
  renderToolResult,
  toolName,
} from "../../src/adapters/tools/mcp-tools.ts";
import type { McpConnection } from "../../src/adapters/tools/mcp.types.ts";
import type { ModelProvider } from "../../src/domain/model.types.ts";

const signal = new AbortController().signal;

test("MCP connections route responses and fail pending and later requests together", async () => {
  const sent: Record<string, unknown>[] = [];
  const connection = mcpConnection("fixture", (line) =>
    sent.push(JSON.parse(line)),
  );
  const first = connection.request("tools/list");
  const second = connection.request("tools/call", { name: "x" });
  connection.receive("");
  connection.receive("[1]");
  connection.receive('{"jsonrpc":"2.0","id":42,"result":{}}');
  connection.receive('{"jsonrpc":"2.0","id":1,"result":{"tools":[]}}');
  assert.deepEqual(await first, { tools: [] });
  assert.deepEqual(sent[0], { jsonrpc: "2.0", id: 1, method: "tools/list" });
  connection.receive('{"jsonrpc":"2.0","id":2,"error":"odd"}');
  await assert.rejects(second, {
    code: "response",
    message: "MCP server fixture returned error undefined: undefined",
  });
  const aborted = AbortSignal.abort("stop");
  await assert.rejects(
    connection.request("ping", undefined, aborted),
    (error) => error === "stop",
  );
  const pending = connection.request("ping");
  const failure = new Error("exited");
  connection.fail(failure);
  connection.fail(new Error("ignored"));
  await assert.rejects(pending, failure);
  await assert.rejects(connection.request("ping"), failure);
  const before = sent.length;
  connection.notify("notifications/initialized");
  assert.equal(sent.length, before);
});

test("MCP cancellation notifies the server only while the connection is open", async () => {
  const sent: Record<string, unknown>[] = [];
  const connection = mcpConnection("fixture", (line) =>
    sent.push(JSON.parse(line)),
  );
  const controller = new AbortController();
  const request = connection.request("tools/call", {}, controller.signal);
  controller.abort("deadline");
  await assert.rejects(request, (error) => error === "deadline");
  assert.deepEqual(sent.at(-1), {
    jsonrpc: "2.0",
    method: "notifications/cancelled",
    params: { requestId: 1, reason: "deadline" },
  });
});

function listing(...pages: unknown[]): McpConnection {
  return {
    async request() {
      return pages.shift();
    },
    notify() {},
    receive() {},
    fail() {},
  };
}

test("MCP tool discovery rejects malformed listings and ambiguous names", async () => {
  await assert.rejects(mcpTools("s", listing(null), signal), {
    code: "response",
  });
  await assert.rejects(mcpTools("s", listing({ tools: {} }), signal), {
    code: "response",
  });
  await assert.rejects(
    mcpTools("s", listing({ tools: [{ inputSchema: {} }] }), signal),
    { code: "response", message: /without a name/ },
  );
  await assert.rejects(
    mcpTools(
      "s",
      listing({ tools: [{ name: "a.b" }, { name: "a_b" }] }),
      signal,
    ),
    { code: "configuration", message: /share the name mcp__s__a_b/ },
  );
  const [tool] = await mcpTools(
    "s",
    listing({ tools: [{ name: "bare" }], nextCursor: "" }),
    signal,
  );
  assert.equal(tool?.description, "Call bare on the s MCP server.");
  assert.deepEqual(tool?.inputSchema, { type: "object" });
  assert.equal(tool?.readOnly, false);
});

test("MCP tool names and results stay within harness contracts", () => {
  assert.equal(toolName("s", "read file"), "mcp__s__read_file");
  const long = toolName("s".repeat(32), "t".repeat(60));
  assert.equal(long.length, 64);
  assert.notEqual(long, toolName("s".repeat(32), `${"t".repeat(59)}u`));
  assert.deepEqual(renderToolResult(null), { content: "", isError: false });
  assert.deepEqual(renderToolResult({ content: "text", isError: "yes" }), {
    content: "",
    isError: false,
  });
  assert.deepEqual(renderToolResult({ content: [{ type: "resource" }, 7] }), {
    content: "[resource undefined]\n7",
    isError: false,
  });
});

test("the built-in harness validates and keeps declared MCP servers", () => {
  const modelProvider: ModelProvider = {
    name: "fixture",
    async request() {
      throw new Error("unused");
    },
  };
  const configured = harness({
    modelProvider,
    mcpServers: { docs: { url: "https://example.com/mcp" } },
  });
  assert.deepEqual(configured.mcpServers, {
    docs: { url: "https://example.com/mcp" },
  });
  assert.equal(harness({ modelProvider }).mcpServers, undefined);
  assert.throws(
    () => harness({ modelProvider, mcpServers: { "a b": { command: "x" } } }),
    { code: "configuration" },
  );
});
