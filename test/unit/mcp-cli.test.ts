import assert from "node:assert/strict";
import { test } from "node:test";
import { agent } from "../../src/domain/agent.ts";
import type { CliHarness } from "../../src/domain/agent.types.ts";
import {
  antigravityHarness,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
} from "../../src/index.ts";
import type { McpServers } from "../../src/index.ts";

const servers: McpServers = {
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
};
const variables = {
  LINEAR_API_KEY: "linear-secret",
  DOCS_TOKEN: "docs-secret",
};

function compose(harness: (settings: object) => CliHarness) {
  return agent({ harness: harness({ mcpServers: servers }) });
}

function assertNoSecrets(value: unknown) {
  const text = JSON.stringify(value);
  assert.ok(!text.includes("linear-secret") && !text.includes("docs-secret"));
}

test("Claude and Copilot receive inline MCP configuration with variable references", () => {
  const claude = compose(claudeHarness).request({ text: "go" });
  const inline = claude.arguments!.find((entry) =>
    entry.startsWith("--mcp-config="),
  )!;
  assert.deepEqual(JSON.parse(inline.slice("--mcp-config=".length)), {
    mcpServers: {
      linear: {
        type: "stdio",
        command: "npx",
        args: ["-y", "linear-mcp"],
        env: { LOG_LEVEL: "warn", LINEAR_API_KEY: "${LINEAR_API_KEY}" },
      },
      docs: {
        type: "http",
        url: "https://mcp.example.com/mcp",
        headers: { "X-Team": "core", Authorization: "Bearer ${DOCS_TOKEN}" },
      },
    },
  });
  const copilot = compose(copilotHarness).request({ text: "go" });
  const index = copilot.arguments!.indexOf("--additional-mcp-config");
  assert.deepEqual(JSON.parse(copilot.arguments![index + 1]!), {
    mcpServers: {
      linear: {
        type: "local",
        command: "npx",
        args: ["-y", "linear-mcp"],
        env: { LOG_LEVEL: "warn", LINEAR_API_KEY: "${LINEAR_API_KEY}" },
        tools: ["*"],
      },
      docs: {
        type: "http",
        url: "https://mcp.example.com/mcp",
        headers: { "X-Team": "core", Authorization: "Bearer ${DOCS_TOKEN}" },
        tools: ["*"],
      },
    },
  });
  const interactive = compose(copilotHarness).request({ interactive: true });
  assert.ok(interactive.arguments!.includes("--additional-mcp-config"));
  for (const command of [claude, copilot]) assertNoSecrets(command);
});

test("Codex receives MCP servers as TOML configuration overrides", () => {
  const command = compose(codexHarness).request({ text: "go" });
  const overrides = command.arguments!.filter(
    (_entry, index, all) => all[index - 1] === "-c",
  );
  assert.deepEqual(overrides, [
    'mcp_servers.linear.command="npx"',
    'mcp_servers.linear.args=["-y","linear-mcp"]',
    'mcp_servers.linear.env={"LOG_LEVEL"="warn"}',
    'mcp_servers.linear.env_vars=["LINEAR_API_KEY"]',
    'mcp_servers.docs.url="https://mcp.example.com/mcp"',
    'mcp_servers.docs.http_headers={"X-Team"="core"}',
    'mcp_servers.docs.bearer_token_env_var="DOCS_TOKEN"',
  ]);
  assert.ok(
    command.arguments!.indexOf("exec") > command.arguments!.lastIndexOf("-c"),
  );
  assertNoSecrets(command);
  const live = compose(codexHarness).request({ text: "go", liveInput: true });
  assert.equal(live.arguments!.at(-1), "app-server");
  assert.deepEqual(
    live.arguments!.filter((_entry, index, all) => all[index - 1] === "-c"),
    overrides,
  );
  const plain = agent({
    harness: codexHarness({ mcpServers: { bare: { command: "server" } } }),
  }).request({ text: "go" });
  assert.deepEqual(plain.arguments!.slice(0, 4), [
    "-c",
    'mcp_servers.bare.command="server"',
    "-c",
    "mcp_servers.bare.args=[]",
  ]);
});

test("Kimi and Antigravity plan home configuration files with the same servers", () => {
  const kimi = compose(kimiHarness).configuration!(variables);
  assert.deepEqual(kimi.files, [
    {
      path: ".kimi-code/mcp.json",
      section: "mcpServers",
      entries: {
        linear: {
          command: "npx",
          args: ["-y", "linear-mcp"],
          env: { LOG_LEVEL: "warn" },
        },
        docs: {
          url: "https://mcp.example.com/mcp",
          headers: { "X-Team": "core" },
          bearerTokenEnvVar: "DOCS_TOKEN",
        },
      },
    },
  ]);
  const antigravity = compose(antigravityHarness).configuration!(variables);
  assert.deepEqual(antigravity.files, [
    {
      path: ".gemini/config/mcp_config.json",
      section: "mcpServers",
      entries: {
        linear: {
          command: "npx",
          args: ["-y", "linear-mcp"],
          env: { LOG_LEVEL: "warn", LINEAR_API_KEY: "${LINEAR_API_KEY}" },
          disabled: false,
        },
        docs: {
          serverUrl: "https://mcp.example.com/mcp",
          headers: {
            "X-Team": "core",
            Authorization: "Bearer ${DOCS_TOKEN}",
          },
          disabled: false,
        },
      },
    },
  ]);
  for (const plan of [kimi, antigravity]) assertNoSecrets(plan);
  for (const harness of [kimiHarness, antigravityHarness]) {
    const request = compose(harness).request({ text: "go" });
    assert.ok(!JSON.stringify(request).includes("mcp"));
  }
});

test("every CLI requires the variables its MCP servers reference", () => {
  const harnesses = [
    claudeHarness,
    codexHarness,
    copilotHarness,
    kimiHarness,
    antigravityHarness,
  ] as const;
  for (const harness of harnesses) {
    const configured = compose(harness);
    assert.equal(
      configured.configuration!(variables).files.length,
      harness === kimiHarness || harness === antigravityHarness ? 1 : 0,
    );
    assert.throws(() => configured.configuration!({ LINEAR_API_KEY: "x" }), {
      code: "configuration",
      message: /Missing DOCS_TOKEN/,
    });
    assert.equal(agent({ harness: harness({}) }).configuration, undefined);
    assert.equal(
      agent({ harness: harness({ mcpServers: {} }) }).configuration,
      undefined,
    );
    assert.throws(
      () => harness({ mcpServers: { linear: { url: "ftp://x" } } }),
      { code: "configuration" },
    );
    assert.ok(
      !JSON.stringify(
        agent({ harness: harness({}) }).request({ text: "go" }),
      ).includes("mcp"),
    );
  }
});

test("Codex reports MCP tool calls with server-qualified names", () => {
  const codex = agent({ harness: codexHarness() });
  const started = codex.events(
    JSON.stringify({
      type: "item.started",
      item: {
        type: "mcp_tool_call",
        id: "call-1",
        server: "linear",
        tool: "search",
        arguments: { query: "bug" },
      },
    }),
  );
  assert.deepEqual(started, [
    {
      kind: "tool",
      name: "mcp__linear__search",
      input: { query: "bug" },
      callId: "call-1",
    },
  ]);
  const completed = codex.events(
    JSON.stringify({
      type: "item.completed",
      item: {
        type: "mcp_tool_call",
        id: "call-1",
        server: "linear",
        tool: "search",
        result: "found",
      },
    }),
  );
  assert.equal(
    completed[0]?.kind === "tool-result" && completed[0].name,
    "mcp__linear__search",
  );
});
