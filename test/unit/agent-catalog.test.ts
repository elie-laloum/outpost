import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  builtInAgent,
  builtInAgentList,
  builtInAgentRecord,
  builtInAgents,
  isBuiltInAgent,
} from "../../src/adapters/agents/catalog.ts";
import type { AgentDescriptor } from "../../src/adapters/agents/agent-descriptor.types.ts";
import { imageRecipe } from "../../src/cli/scaffold.constants.ts";
import * as api from "../../src/index.ts";

const descriptors: readonly AgentDescriptor[] = builtInAgents;

test("built-in agents have unique names and bind adapters under the same name", () => {
  const names = builtInAgents.map((agent) => agent.name);
  assert.equal(new Set(names).size, names.length);
  for (const descriptor of descriptors) {
    const adapter = descriptor.harness().bind();
    assert.equal(adapter.name, descriptor.name);
    assert.equal(adapter.bootstrap, descriptor.name);
    assert.ok(descriptor.label.length > 0);
  }
});

test("each descriptor names the public export that builds its harness", () => {
  const exports: Record<string, unknown> = api;
  for (const descriptor of descriptors)
    assert.equal(
      exports[descriptor.harnessExport],
      descriptor.harness,
      `${descriptor.harnessExport} is not exported for ${descriptor.name}`,
    );
});

test("each descriptor supplies doctor diagnostics and protocol fixtures", () => {
  for (const descriptor of descriptors) {
    assert.ok(descriptor.doctor.diagnostics().length > 0, descriptor.name);
    assert.ok(descriptor.protocol.length > 0, descriptor.name);
  }
});

test("authentication choices declare the variables their setting reads", () => {
  for (const descriptor of descriptors) {
    const values = descriptor.authentication.map((choice) => choice.value);
    assert.equal(new Set(values).size, values.length, descriptor.name);
    assert.ok(values.includes("account"), descriptor.name);
    for (const choice of descriptor.authentication)
      assert.equal(
        choice.variable === undefined,
        choice.value === "account",
        `${descriptor.name} ${choice.value}`,
      );
  }
});

test("the agent image lock and recipe install every built-in agent", async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL("../../images/agents/package.json", import.meta.url),
      "utf8",
    ),
  );
  const npm = new Set<string>();
  for (const { install, version, executable } of descriptors) {
    if (install.kind === "script") {
      assert.ok(
        imageRecipe.includes(install.script(`/usr/local/bin/${executable}`)),
      );
      continue;
    }
    npm.add(install.package);
    assert.equal(manifest.dependencies[install.package], version);
    assert.equal(
      manifest.allowScripts?.[install.package],
      install.allowScripts,
    );
    assert.ok(imageRecipe.includes(`${install.package}@${version}`));
  }
  assert.deepEqual(Object.keys(manifest.dependencies).sort(), [...npm].sort());
});

test("catalog lookups reject unknown agents and derive complete records", () => {
  assert.equal(builtInAgent("gemini"), undefined);
  assert.equal(isBuiltInAgent("gemini"), false);
  assert.equal(isBuiltInAgent("kimi"), true);
  assert.equal(
    builtInAgentList(),
    "codex, claude, antigravity, copilot or kimi",
  );
  assert.deepEqual(
    Object.keys(builtInAgentRecord((agent) => agent.version)),
    builtInAgents.map((agent) => agent.name),
  );
});
