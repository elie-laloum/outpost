import assert from "node:assert/strict";
import {
  chmod,
  mkdir,
  readFile,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { configureAgent } from "../../src/application/agent-configuration.ts";
import type {
  AgentConfiguration,
  CliAgent,
} from "../../src/domain/agent.types.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
  createKimiHarness,
  createSandbox,
} from "../../src/index.ts";
import { kimiMcpStoreKey } from "../../src/adapters/agents/kimi-mcp.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const signal = new AbortController().signal;

function lease(home: string): SandboxLease {
  return {
    root: home,
    home,
    invoke: executeProcess,
    async upload() {},
    async download() {},
    async release() {},
  };
}

function configured(plan: AgentConfiguration): CliAgent {
  return { ...scripted(emit("done")), configuration: () => plan };
}

const file = (entries: Record<string, unknown>) => ({
  files: [{ path: ".tool/mcp.json", section: "mcpServers", entries }],
});

test(
  "MCP configuration merges into existing home files without discarding user entries",
  { skip: process.platform === "win32" },
  async (t) => {
    const home = await repository(t);
    await mkdir(join(home, "dotfiles"));
    const real = join(home, "dotfiles", "mcp.json");
    await writeFile(
      real,
      JSON.stringify({
        theme: "dark",
        mcpServers: { mine: { command: "keep" }, linear: { command: "old" } },
      }),
    );
    await chmod(real, 0o640);
    await mkdir(join(home, ".tool"));
    await symlink(real, join(home, ".tool", "mcp.json"));
    await configureAgent(
      configured(file({ linear: { command: "new" } })),
      {},
      lease(home),
      "remote",
      signal,
    );
    assert.deepEqual(JSON.parse(await readFile(real, "utf8")), {
      theme: "dark",
      mcpServers: { mine: { command: "keep" }, linear: { command: "new" } },
    });
    assert.equal((await stat(real)).mode & 0o777, 0o640);
    assert.ok((await stat(join(home, ".tool", "mcp.json"))).isFile());

    const fresh = await repository(t);
    await configureAgent(
      configured({
        files: [
          {
            path: ".gemini/config/mcp_config.json",
            section: "mcpServers",
            entries: { docs: { serverUrl: "https://example.com/mcp" } },
          },
        ],
      }),
      {},
      lease(fresh),
      "remote",
      signal,
    );
    const created = join(fresh, ".gemini", "config", "mcp_config.json");
    assert.deepEqual(JSON.parse(await readFile(created, "utf8")), {
      mcpServers: { docs: { serverUrl: "https://example.com/mcp" } },
    });
    assert.equal((await stat(created)).mode & 0o777, 0o600);
  },
);

test("MCP configuration refuses to replace unreadable files or leave the home", async (t) => {
  const home = await repository(t);
  await mkdir(join(home, ".tool"));
  const target = join(home, ".tool", "mcp.json");
  for (const content of ["{not json", "[]", '{"mcpServers":[]}']) {
    await writeFile(target, content);
    await assert.rejects(
      configureAgent(
        configured(file({ linear: { command: "x" } })),
        {},
        lease(home),
        "remote",
        signal,
      ),
      { code: "process" },
    );
    assert.equal(await readFile(target, "utf8"), content);
  }
  for (const path of ["../escape.json", "/etc/mcp.json", "a/./b.json"])
    await assert.rejects(
      configureAgent(
        configured({
          files: [{ path, section: "mcpServers", entries: {} }],
        }),
        {},
        lease(home),
        "remote",
        signal,
      ),
      { code: "process" },
    );
  await configureAgent(
    scripted(emit("done")),
    {},
    lease(home),
    "remote",
    signal,
  );
  await configureAgent(
    configured({ files: [] }),
    {},
    lease(home),
    "remote",
    signal,
  );
});

test("sandboxes check MCP variables once per adapter before running the agent", async (t) => {
  const root = await repository(t);
  const checks: string[] = [];
  const fixture: CliAgent = {
    ...scripted(emit("<outpost>done</outpost>")),
    configuration(variables) {
      checks.push(variables.MCP_TOKEN ?? "missing");
      if (!variables.MCP_TOKEN) throw new Error("Missing MCP_TOKEN");
      return { files: [] };
    },
  };
  await using sandbox = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  await assert.rejects(
    sandbox.dispatch({ agent: fixture, brief: { text: "run" } }),
    /Missing MCP_TOKEN/,
  );
  const declared: CliAgent = { ...fixture, variables: { MCP_TOKEN: "set" } };
  for (let index = 0; index < 2; index += 1)
    await sandbox.dispatch({ agent: declared, brief: { text: "run" } });
  assert.deepEqual(checks, ["missing", "set"]);
});

test("host MCP OAuth logins are merged into the sandbox home without other entries", async (t) => {
  const host = await repository(t);
  const sandbox = await repository(t);
  const saved = {
    CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR,
    CODEX_HOME: process.env.CODEX_HOME,
    KIMI_CODE_HOME: process.env.KIMI_CODE_HOME,
  };
  t.after(() => {
    for (const [name, value] of Object.entries(saved))
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
  });
  process.env.CLAUDE_CONFIG_DIR = join(host, "claude");
  process.env.CODEX_HOME = join(host, "codex");
  process.env.KIMI_CODE_HOME = join(host, "kimi");
  const url = "https://mcp.linear.app/mcp";
  const login = {
    mcpServers: { linear: { url, oauth: "login" as const } },
  };
  await mkdir(join(host, "claude"), { recursive: true });
  await writeFile(
    join(host, "claude", ".credentials.json"),
    JSON.stringify({
      claudeAiOauth: { accessToken: "host-subscription" },
      mcpOAuth: {
        "linear|abc": {
          serverName: "linear",
          serverUrl: url,
          accessToken: "a",
        },
        "other|def": { serverName: "other", serverUrl: url, accessToken: "b" },
      },
    }),
  );
  await mkdir(join(host, "codex"), { recursive: true });
  await writeFile(
    join(host, "codex", ".credentials.json"),
    JSON.stringify({
      "linear|123": {
        server_name: "linear",
        server_url: url,
        access_token: "c",
      },
      "linear:456": {
        server_name: "linear",
        server_url: url,
        executor_owned: true,
      },
    }),
  );
  const key = kimiMcpStoreKey("linear", url);
  await mkdir(join(host, "kimi", "credentials", "mcp"), { recursive: true });
  await writeFile(
    join(host, "kimi", "credentials", "mcp", `${key}-tokens.json`),
    JSON.stringify({ access_token: "d" }),
  );
  await writeFile(
    join(host, "kimi", "credentials", "mcp", `${key}-client.json`),
    JSON.stringify({ client_id: "e" }),
  );
  await mkdir(join(sandbox, ".claude"));
  await writeFile(
    join(sandbox, ".claude", ".credentials.json"),
    JSON.stringify({ claudeAiOauth: { accessToken: "sandbox-subscription" } }),
  );
  const agents = [
    createAgent({ harness: createClaudeHarness(login) }),
    createAgent({ harness: createCodexHarness(login) }),
    createAgent({ harness: createKimiHarness(login) }),
  ];
  for (const selected of agents)
    await configureAgent(selected, {}, lease(sandbox), "remote", signal);
  const read = async (...path: string[]) =>
    JSON.parse(await readFile(join(sandbox, ...path), "utf8"));
  assert.deepEqual(await read(".claude", ".credentials.json"), {
    claudeAiOauth: { accessToken: "sandbox-subscription" },
    mcpOAuth: {
      "linear|abc": { serverName: "linear", serverUrl: url, accessToken: "a" },
    },
  });
  assert.deepEqual(Object.keys(await read(".codex", ".credentials.json")), [
    "linear|123",
  ]);
  assert.deepEqual(
    await read(".kimi-code", "credentials", "mcp", `${key}-client.json`),
    { client_id: "e" },
  );
  await assert.rejects(
    readFile(
      join(sandbox, ".kimi-code", "credentials", "mcp", `${key}-meta.json`),
    ),
    { code: "ENOENT" },
  );
  const local = await repository(t);
  for (const selected of agents)
    await configureAgent(selected, {}, lease(local), "host", signal);
  await assert.rejects(readFile(join(local, ".codex", ".credentials.json")), {
    code: "ENOENT",
  });
  const missing = createAgent({
    harness: createClaudeHarness({
      mcpServers: { docs: { url: "https://docs.example/mcp", oauth: "login" } },
    }),
  });
  await assert.rejects(
    configureAgent(missing, {}, lease(sandbox), "remote", signal),
    { code: "configuration", message: /claude mcp login docs/ },
  );
  process.env.KIMI_CODE_HOME = join(host, "empty");
  await assert.rejects(
    configureAgent(agents[2]!, {}, lease(sandbox), "remote", signal),
    { code: "configuration", message: /MCP OAuth login was not found/ },
  );
});
