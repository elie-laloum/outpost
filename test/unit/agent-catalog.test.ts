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
import { imageRecipeText, officialImage } from "../../src/cli/image-recipes.ts";
import * as api from "../../src/core.ts";

const descriptors: readonly AgentDescriptor[] = builtInAgents;

test("built-in agents have unique names and bind adapters under the same name", () => {
  const names = builtInAgents.map((agent) => agent.name);
  assert.equal(new Set(names).size, names.length);
  for (const descriptor of descriptors) {
    const adapter = descriptor.harness().bind();
    assert.equal(adapter.name, descriptor.name);
    assert.equal(adapter.bootstrap, descriptor.name);
    assert.equal(adapter.storage?.format, descriptor.conversations?.().format);
    assert.equal(
      descriptor.conversations?.().format ?? descriptor.name,
      descriptor.name,
    );
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

test("each agent image locks and installs only its own CLI", async () => {
  for (const { name, install, version, executable } of descriptors) {
    const recipe = imageRecipeText(officialImage(name)!);
    if (install.kind === "script") {
      assert.ok(
        recipe.includes(install.script(`/usr/local/bin/${executable}`)),
      );
      continue;
    }
    const manifest = JSON.parse(
      await readFile(
        new URL(`../../images/${name}/package.json`, import.meta.url),
        "utf8",
      ),
    );
    assert.deepEqual(manifest.dependencies, { [install.package]: version });
    assert.equal(
      manifest.allowScripts?.[install.package],
      install.allowScripts,
    );
    const lock = JSON.parse(
      await readFile(
        new URL(`../../images/${name}/package-lock.json`, import.meta.url),
        "utf8",
      ),
    );
    assert.equal(
      lock.packages[`node_modules/${install.package}`].version,
      version,
    );
    assert.match(recipe, /RUN npm ci --prefix \/opt\/outpost\/[a-z]+ /);
    for (const other of descriptors)
      if (other.name !== name && other.install.kind === "npm")
        assert.ok(
          !recipe.includes(other.install.package),
          `${name} ${other.name}`,
        );
  }
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
