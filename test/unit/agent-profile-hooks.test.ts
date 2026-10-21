import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createKimiHarness,
  createAntigravityHarness,
  defineAgentProfile,
  defineClaudeHook,
  defineCodexHook,
  defineCopilotHook,
  defineKimiHook,
  defineAntigravityHook,
  OutpostError,
} from "../../src/core.ts";
import { createHarness, defineHarnessHook } from "../../src/harness.ts";
import type { AgentProfileHooks } from "../../src/core.ts";

const claude = defineClaudeHook({
  on: "SessionStart",
  name: "profile",
  run() {},
});
const codex = defineCodexHook({
  on: "SessionStart",
  name: "profile",
  run() {},
});
const copilot = defineCopilotHook({
  on: "sessionStart",
  name: "profile",
  run() {},
});
const kimi = defineKimiHook({ on: "SessionStart", name: "profile", run() {} });
const antigravity = defineAntigravityHook({
  on: "SessionStart",
  name: "profile",
  run() {},
});
const outpost = defineHarnessHook({
  on: "session-start",
  name: "profile",
  run() {},
});
const groups: AgentProfileHooks = {
  claude: [claude],
  codex: [codex],
  copilot: [copilot],
  kimi: [kimi],
  antigravity: [antigravity],
  outpost: [outpost],
};

const invalid = (action: () => unknown) =>
  assert.throws(
    action,
    (error) => error instanceof OutpostError && error.code === "configuration",
  );

test("profile hook sections reject malformed groups and foreign declarations", () => {
  for (const hooks of [
    null,
    [],
    "hooks",
    { other: [] },
    { claude: {} },
    { claude: [null] },
    { claude: [codex] },
    { codex: [outpost] },
    { outpost: [claude] },
    { outpost: {} },
    { outpost: [{ kind: "hook" }] },
    { outpost: [{ ...outpost, on: "unknown" }] },
    { outpost: [{ ...outpost, timeoutMs: -1 }] },
    { claude: [{ ...claude, timeoutMs: Infinity }] },
    { claude: [{ ...claude, timeoutMs: 600001 }] },
    { claude: [{ ...claude, run: undefined }] },
    { claude: [{ ...claude, matcher: 1 }] },
  ])
    invalid(() => Reflect.apply(defineAgentProfile, undefined, [{ hooks }]));
  const wrong: AgentProfileHooks = {
    // @ts-expect-error A Codex hook cannot be assigned to Claude.
    claude: [codex],
    // @ts-expect-error An Outpost hook cannot be assigned to Kimi.
    kimi: [outpost],
    // @ts-expect-error Native hooks cannot be assigned to Outpost.
    outpost: [claude],
  };
  invalid(() => defineAgentProfile({ hooks: wrong }));
});

test("profiles snapshot and freeze selected hook arrays and command declarations", () => {
  const args = ["audit.mjs"];
  const command = defineClaudeHook({
    on: "SessionStart",
    command: { executable: "node", arguments: args },
  });
  const native = [command];
  const custom = [outpost];
  const hooks = { claude: native, outpost: custom };
  const profile = defineAgentProfile({ hooks });
  args.push("changed");
  native.length = 0;
  custom.length = 0;
  assert.equal(profile.hooks?.claude?.length, 1);
  assert.deepEqual(profile.hooks?.claude?.[0]?.command?.arguments, [
    "audit.mjs",
  ]);
  assert.deepEqual(profile.hooks?.outpost, [outpost]);
  assert.ok(Object.isFrozen(profile.hooks));
  assert.ok(Object.isFrozen(profile.hooks?.claude));
  assert.ok(Object.isFrozen(profile.hooks?.claude?.[0]));
  assert.ok(Object.isFrozen(profile.hooks?.outpost));
  assert.deepEqual(defineAgentProfile({ hooks: {} }).hooks, {});
});

test("each CLI selects only its profile hooks and appends local declarations", () => {
  const profile = defineAgentProfile({ hooks: groups });
  const harnesses = [
    createClaudeHarness({ profile, hooks: [{ ...claude, name: "local" }] }),
    createCodexHarness({ profile, hooks: [{ ...codex, name: "local" }] }),
    createCopilotHarness({ profile, hooks: [{ ...copilot, name: "local" }] }),
    createKimiHarness({ profile, hooks: [{ ...kimi, name: "local" }] }),
    createAntigravityHarness({
      profile,
      hooks: [{ ...antigravity, name: "local" }],
    }),
  ];
  for (const harness of harnesses) {
    const first = createAgent({ harness });
    assert.deepEqual(
      first.hooks?.handlers.map((hook) => hook.name),
      ["profile", "local"],
    );
    assert.deepEqual(
      createAgent({ harness }).hooks?.handlers.map((hook) => hook.name),
      ["profile", "local"],
    );
  }
  assert.equal(
    createAgent({
      harness: createCodexHarness({
        profile: defineAgentProfile({ hooks: { claude: [claude] } }),
      }),
    }).hooks,
    undefined,
  );
  assert.deepEqual(
    createAgent({
      harness: createClaudeHarness({ profile, hooks: [] }),
    }).hooks?.handlers.map((hook) => hook.name),
    ["profile"],
  );
});

test("Outpost selects its profile hooks without changing local-only declarations", () => {
  const modelProvider = {
    name: "test",
    request: async () => ({ text: "done" }),
  };
  const profile = defineAgentProfile({ hooks: groups });
  const local = defineHarnessHook({
    on: "session-start",
    name: "local",
    run() {},
  });
  const harness = createHarness({ modelProvider, profile, hooks: [local] });
  assert.deepEqual(
    harness.hooks.map((hook) => hook.name),
    ["profile", "local"],
  );
  assert.deepEqual(createHarness({ modelProvider, profile, hooks: [] }).hooks, [
    outpost,
  ]);
  assert.deepEqual(createHarness({ modelProvider, hooks: [local] }).hooks, [
    local,
  ]);
  invalid(() =>
    Reflect.apply(createHarness, undefined, [
      { modelProvider, profile, hooks: null },
    ]),
  );
});

test("a CLI validates native event names when composing profile declarations", () => {
  const profile = defineAgentProfile({
    hooks: { claude: [{ ...claude, on: "NotAnEvent" }] },
  });
  invalid(() => createClaudeHarness({ profile }));
  invalid(() =>
    Reflect.apply(createClaudeHarness, undefined, [{ hooks: [null] }]),
  );
});
