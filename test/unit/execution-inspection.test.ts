import assert from "node:assert/strict";
import { test } from "node:test";
import { inspectExecution } from "../../src/application/execution-inspection.ts";
import { validateFileSandbox } from "../../src/application/file-sandbox-validation.ts";
import { createScriptedAgent } from "../../src/adapters/testing/scripted-agent.ts";
import { createClaudeHarness } from "../../src/adapters/agents/claude/claude-adapter.ts";
import { createAntigravityHarness } from "../../src/adapters/agents/antigravity/antigravity-adapter.ts";
import { createAgent } from "../../src/domain/agent.ts";
import { createFallbackAgent } from "../../src/domain/fallback-agent.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";

const mount = {
  kind: "directory",
  directory: "/source",
  access: { mode: "mount", target: "work", readOnly: true },
} as const;

test("file inspections report bindings, agent features and requirements without allocating", () => {
  const sandboxProvider = createLocalSandboxProvider();
  const agent = createAgent({ harness: createClaudeHarness() });
  const plan = inspectExecution(
    { workspaceSource: { kind: "ephemeral" }, sandboxProvider, agent },
    { continuation: { id: "previous" } },
  );
  assert.deepEqual(plan.workspace, { kind: "ephemeral", binding: "ephemeral" });
  assert.deepEqual(plan.sandbox, {
    provider: "local",
    placement: "host",
    bindings: ["copy", "ephemeral"],
  });
  assert.deepEqual(plan.agents, [
    { name: "claude", kind: "cli", fileWorkspaces: agent.fileWorkspaces },
  ]);
  assert.deepEqual(plan.requirements, [
    { kind: "binding", binding: "ephemeral" },
    { kind: "agent", agent: "claude", capability: "dispatch" },
    { kind: "agent", agent: "claude", capability: "continuation" },
  ]);
  assert.deepEqual(plan.diagnostics, []);
});

test("file inspections list every refusal that sandbox creation and dispatch raise", async () => {
  const sandboxProvider = createLocalSandboxProvider();
  const scripted = createScriptedAgent({
    turns: [
      { text: "done", commit: { message: "change", files: { "a.txt": "a" } } },
    ],
  });
  const antigravity = createAgent({ harness: createAntigravityHarness() });
  const plan = inspectExecution(
    {
      workspaceSource: mount,
      sandboxProvider,
      agent: createFallbackAgent([scripted, antigravity], { on: ["quota"] }),
    },
    { continuation: { id: "previous" } },
  );
  assert.equal(plan.workspace.binding, "mount-readonly");
  assert.deepEqual(
    plan.diagnostics.map((diagnostic) => diagnostic.message),
    [
      "Sandbox provider does not support mount-readonly workspaces",
      "scripted has not declared validated support for file workspaces",
      "Agent continuation is not validated for file workspaces",
    ],
  );
  await assert.rejects(
    validateFileSandbox({ workspaceSource: mount, sandboxProvider }),
    /Sandbox provider does not support mount-readonly workspaces/,
  );
  const { workspaces: _workspaces, ...hostOnly } = sandboxProvider;
  assert.deepEqual(
    inspectExecution({
      workspaceSource: { kind: "ephemeral" },
      sandboxProvider: hostOnly,
    }).diagnostics,
    [
      {
        code: "unsupported-provider",
        message: "Sandbox provider does not support file workspaces",
      },
    ],
  );
});

test("Git inspections describe the sandbox and agents without file requirements", () => {
  const agent = createAgent({ harness: createClaudeHarness() });
  assert.deepEqual(inspectExecution({ repository: "/repository", agent }), {
    workspace: { kind: "git" },
    sandbox: { provider: "docker", placement: "mounted", bindings: [] },
    agents: [
      { name: "claude", kind: "cli", fileWorkspaces: agent.fileWorkspaces },
    ],
    requirements: [],
    diagnostics: [],
  });
  const local = createLocalSandboxProvider();
  assert.deepEqual(
    inspectExecution({ repository: "/repository", sandboxProvider: local })
      .sandbox,
    { provider: "local", placement: "host", bindings: ["copy", "ephemeral"] },
  );
});
