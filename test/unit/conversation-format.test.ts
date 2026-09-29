import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAgent,
  createAntigravityHarness,
  createClaudeConversations,
  createCodexConversations,
  createCopilotConversations,
  createKimiConversations,
  createClaudeHarness,
  createCodexHarness,
  createCopilotHarness,
  createHarness,
  createHarnessConversations,
  createKimiHarness,
  createLocalTransport,
  createTransportConversations,
  type ConversationStore,
  type ModelProvider,
} from "../../src/index.ts";
import { isConversationStore } from "../../src/domain/conversation.ts";

const modelProvider: ModelProvider = {
  name: "p",
  request: async () => ({ text: "" }),
};
const custom = (format?: unknown): ConversationStore =>
  ({
    name: "custom",
    ...(format === undefined ? {} : { format }),
    locate: async () => assert.fail("unused"),
    capture: async () => assert.fail("unused"),
    restore: async () => {},
  }) as unknown as ConversationStore;

test("built-in conversation stores declare their format", () => {
  const transporter = createLocalTransport({ directory: "unused" });
  const stores = {
    claude: createClaudeConversations(),
    codex: createCodexConversations(),
    copilot: createCopilotConversations(),
    kimi: createKimiConversations(),
  };
  for (const [format, store] of Object.entries(stores)) {
    assert.equal(store.format, format);
    assert.equal(store.name, format);
    assert.equal(
      createTransportConversations(store, { transporter, namespace: "team" })
        .format,
      format,
    );
    assert.equal(
      createTransportConversations(format, { transporter, namespace: "team" })
        .name,
      `transport:team:${format}`,
    );
  }
  assert.throws(
    () =>
      createTransportConversations("gemini", {
        transporter,
        namespace: "team",
      }),
    /Unsupported conversation format/,
  );
  assert.throws(
    () =>
      createTransportConversations(custom(), {
        transporter,
        namespace: "team",
      }),
    /base store with a format/,
  );
  assert.equal(createHarnessConversations().format, "harness");
  assert.equal(
    createTransportConversations("harness", { transporter, namespace: "team" })
      .format,
    "harness",
  );
});

test("conversation store validation checks the store shape and format type", () => {
  assert.equal(isConversationStore(custom()), true);
  assert.equal(isConversationStore(custom("kimi")), true);
  assert.equal(isConversationStore(custom(1)), false);
  assert.equal(isConversationStore({ locate() {} }), false);
  assert.equal(isConversationStore(null), false);
  assert.equal(isConversationStore("kimi"), false);
});

test("harness conversations must use the harness format when declared", () => {
  const transporter = createLocalTransport({ directory: "unused" });
  assert.throws(
    () =>
      createHarness({
        modelProvider,
        conversations: createTransportConversations("claude", {
          transporter,
          namespace: "team",
        }),
      }),
    /Harness conversations must use the "harness" format, not "claude"/,
  );
  assert.throws(
    () => createHarness({ modelProvider, conversations: custom(1) }),
    /conversation store or false/,
  );
  const store = custom();
  assert.equal(
    createHarness({ modelProvider, conversations: store }).conversations,
    store,
  );
  assert.ok(
    createHarness({
      modelProvider,
      conversations: createHarnessConversations(),
    }).conversations,
  );
  assert.equal(
    createHarness({ modelProvider, conversations: false }).conversations,
    false,
  );
});

const presets = {
  claude: ["Claude Code", createClaudeHarness],
  codex: ["Codex", createCodexHarness],
  copilot: ["GitHub Copilot CLI", createCopilotHarness],
  kimi: ["Kimi Code", createKimiHarness],
} as const;

for (const [format, [label, preset]] of Object.entries(presets)) {
  test(`${label} stores conversations only in a compatible store`, () => {
    const transporter = createLocalTransport({ directory: "unused" });
    const conversations = createTransportConversations(format as "kimi", {
      transporter,
      namespace: "team",
    });
    assert.equal(
      createAgent({ harness: preset({ conversations }) }).storage,
      conversations,
    );
    assert.equal(createAgent({ harness: preset() }).storage?.format, format);
    const store = custom();
    assert.equal(
      createAgent({ harness: preset({ conversations: store }) }).storage,
      store,
    );
    const other = format === "claude" ? "codex" : "claude";
    assert.throws(
      () =>
        preset({
          conversations: createTransportConversations(other, {
            transporter,
            namespace: "team",
          }),
        }),
      new RegExp(
        `${label} conversations must use the "${format}" format, not "${other}"`,
      ),
    );
    assert.throws(
      () => preset({ conversations: custom("harness") }),
      /format, not "harness"/,
    );
    assert.throws(
      () => preset({ conversations: { name: "broken" } as never }),
      new RegExp(`${label} conversations must be a conversation store`),
    );
  });
}

test("Claude and Codex reject stored conversations when capture is disabled", () => {
  for (const [label, preset] of [presets.claude, presets.codex])
    assert.throws(
      () => preset({ saveConversations: false, conversations: custom() }),
      new RegExp(
        `${label} cannot store conversations when saveConversations is false`,
      ),
    );
  assert.equal(
    createAgent({ harness: createClaudeHarness({ saveConversations: false }) })
      .capture,
    false,
  );
});

test("Antigravity rejects conversation stores", () => {
  assert.throws(
    () =>
      createAntigravityHarness({
        conversations: createHarnessConversations(),
      } as never),
    /Antigravity has no portable conversation capture; conversations cannot be stored/,
  );
  assert.equal(
    createAgent({
      harness: createAntigravityHarness({ conversations: undefined } as never),
    }).storage,
    undefined,
  );
});
