import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isMcpStdioServer,
  mcpServers,
  mcpServerVariables,
  mcpToolFilter,
} from "../../src/domain/mcp-server.ts";

test("MCP server declarations normalize stdio and HTTP servers", () => {
  const servers = mcpServers({
    linear: {
      command: "npx",
      arguments: ["-y", "linear-mcp"],
      environment: { LOG_LEVEL: "warn" },
      variables: ["LINEAR_API_KEY", "LINEAR_API_KEY"],
    },
    docs: {
      url: "https://mcp.example.com/mcp",
      headers: { "X-Team": "core" },
      bearerTokenVariable: "DOCS_TOKEN",
    },
    bare: { command: "server" },
  });
  assert.deepEqual(servers, {
    linear: {
      command: "npx",
      arguments: ["-y", "linear-mcp"],
      environment: { LOG_LEVEL: "warn" },
      variables: ["LINEAR_API_KEY"],
    },
    docs: {
      url: "https://mcp.example.com/mcp",
      headers: { "X-Team": "core" },
      bearerTokenVariable: "DOCS_TOKEN",
    },
    bare: { command: "server" },
  });
  assert.ok(Object.isFrozen(servers) && Object.isFrozen(servers.linear));
  assert.equal(isMcpStdioServer(servers.linear!), true);
  assert.equal(isMcpStdioServer(servers.docs!), false);
  assert.deepEqual(mcpServerVariables(servers), [
    "LINEAR_API_KEY",
    "DOCS_TOKEN",
  ]);
  assert.deepEqual(mcpServers({}), {});
});

test("MCP server declarations reject ambiguous, unsafe and secret-bearing values", () => {
  for (const value of [
    null,
    [],
    "linear",
    { "bad name": { command: "x" } },
    { ["x".repeat(33)]: { command: "x" } },
    { linear: null },
    { linear: {} },
    { linear: { command: "x", url: "https://example.com" } },
    { linear: { command: "" } },
    { linear: { command: "x", cwd: "/work" } },
    { linear: { command: "x", arguments: "-y" } },
    { linear: { command: "x", arguments: [1] } },
    { linear: { command: "x", arguments: ["${TOKEN}"] } },
    { linear: { command: "x", environment: { "BAD-NAME": "1" } } },
    { linear: { command: "x", environment: { TOKEN: "${TOKEN}" } } },
    { linear: { command: "x", environment: { TOKEN: 1 } } },
    { linear: { command: "x", variables: ["BAD-NAME"] } },
    { linear: { command: "x", variables: "TOKEN" } },
    {
      linear: {
        command: "x",
        environment: { TOKEN: "a" },
        variables: ["TOKEN"],
      },
    },
    { docs: { url: "not a url" } },
    { docs: { url: "ftp://example.com/mcp" } },
    { docs: { url: "https://user:secret@example.com/mcp" } },
    { docs: { url: "https://example.com/${PATH}" } },
    { docs: { url: "https://example.com", headers: { "Bad Header": "x" } } },
    { docs: { url: "https://example.com", headers: { X: "a\r\nb" } } },
    { docs: { url: "https://example.com", headers: { X: "${TOKEN}" } } },
    { docs: { url: "https://example.com", bearerTokenVariable: "BAD-NAME" } },
    {
      docs: {
        url: "https://example.com",
        headers: { authorization: "Bearer x" },
        bearerTokenVariable: "TOKEN",
      },
    },
    { docs: { url: "https://example.com", variables: ["TOKEN"] } },
  ])
    assert.throws(() => mcpServers(value), { code: "configuration" });
});

test("MCP tool filters list distinct names and select tools by include then exclude", () => {
  const servers = mcpServers({
    linear: {
      command: "npx",
      tools: { include: ["search", "read.doc"], exclude: ["read.doc"] },
    },
    docs: { url: "https://mcp.example.com/mcp", tools: { exclude: ["drop"] } },
  });
  assert.deepEqual(servers.linear?.tools, {
    include: ["search", "read.doc"],
    exclude: ["read.doc"],
  });
  assert.ok(Object.isFrozen(servers.linear?.tools?.include));
  const linear = mcpToolFilter(servers.linear?.tools);
  assert.deepEqual(["search", "read.doc", "other"].filter(linear), ["search"]);
  assert.deepEqual(
    ["drop", "keep"].filter(mcpToolFilter(servers.docs?.tools)),
    ["keep"],
  );
  assert.deepEqual(["any"].filter(mcpToolFilter(undefined)), ["any"]);
  for (const tools of [
    null,
    [],
    {},
    { only: ["a"] },
    { include: [] },
    { exclude: "a" },
    { include: ["a", "a"] },
    { include: ["bad name"] },
    { exclude: ["x".repeat(129)] },
    { include: [1] },
  ])
    assert.throws(() => mcpServers({ linear: { command: "x", tools } }), {
      code: "configuration",
    });
});

test("MCP startup timeouts are bounded positive integers", () => {
  assert.equal(
    mcpServers({ a: { command: "x", startupTimeoutMs: 1_000 } }).a
      ?.startupTimeoutMs,
    1_000,
  );
  for (const startupTimeoutMs of [0, -1, 1.5, "1000", 2_147_483_648])
    assert.throws(
      () => mcpServers({ a: { url: "https://example.com", startupTimeoutMs } }),
      { code: "configuration", message: /startupTimeoutMs/ },
    );
});
