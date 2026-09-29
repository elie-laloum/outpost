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
import { createSandbox } from "../../src/index.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
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
        signal,
      ),
      { code: "process" },
    );
  await configureAgent(scripted(emit("done")), {}, lease(home), signal);
  await configureAgent(configured({ files: [] }), {}, lease(home), signal);
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
    sandboxProvider: localSandboxProvider(),
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
