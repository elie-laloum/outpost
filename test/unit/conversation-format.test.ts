import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agent,
  antigravityHarness,
  claudeHarness,
  codexHarness,
  copilotHarness,
  harness,
  harnessConversations,
  kimiHarness,
  localTransport,
  transportConversations,
  type ConversationStore,
  type ModelProvider,
} from "../../src/index.ts";
import { nativeConversations } from "../../src/infrastructure/conversations/native-store.ts";
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
  const transporter = localTransport({ directory: "unused" });
  for (const format of ["claude", "codex", "copilot", "kimi"] as const) {
    assert.equal(nativeConversations(format).format, format);
    assert.equal(
      transportConversations(format, { transporter, namespace: "team" }).format,
      format,
    );
  }
  assert.equal(harnessConversations().format, "harness");
  assert.equal(
    transportConversations("harness", { transporter, namespace: "team" })
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
  const transporter = localTransport({ directory: "unused" });
  assert.throws(
    () =>
      harness({
        modelProvider,
        conversations: transportConversations("claude", {
          transporter,
          namespace: "team",
        }),
      }),
    /Harness conversations must use the "harness" format, not "claude"/,
  );
  assert.throws(
    () => harness({ modelProvider, conversations: custom(1) }),
    /conversation store or false/,
  );
  const store = custom();
  assert.equal(
    harness({ modelProvider, conversations: store }).conversations,
    store,
  );
  assert.ok(
    harness({ modelProvider, conversations: harnessConversations() })
      .conversations,
  );
  assert.equal(
    harness({ modelProvider, conversations: false }).conversations,
    false,
  );
});

const presets = {
  claude: ["Claude Code", claudeHarness],
  codex: ["Codex", codexHarness],
  copilot: ["GitHub Copilot CLI", copilotHarness],
  kimi: ["Kimi Code", kimiHarness],
} as const;

for (const [format, [label, preset]] of Object.entries(presets)) {
  test(`${label} stores conversations only in a compatible store`, () => {
    const transporter = localTransport({ directory: "unused" });
    const conversations = transportConversations(format as "kimi", {
      transporter,
      namespace: "team",
    });
    assert.equal(
      agent({ harness: preset({ conversations }) }).storage,
      conversations,
    );
    assert.equal(agent({ harness: preset() }).storage, undefined);
    const store = custom();
    assert.equal(
      agent({ harness: preset({ conversations: store }) }).storage,
      store,
    );
    const other = format === "claude" ? "codex" : "claude";
    assert.throws(
      () =>
        preset({
          conversations: transportConversations(other, {
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
    agent({ harness: claudeHarness({ saveConversations: false }) }).capture,
    false,
  );
});

test("Antigravity rejects conversation stores", () => {
  assert.throws(
    () =>
      antigravityHarness({
        conversations: harnessConversations(),
      } as never),
    /Antigravity has no portable conversation capture; conversations cannot be stored/,
  );
  assert.equal(
    agent({
      harness: antigravityHarness({ conversations: undefined } as never),
    }).storage,
    undefined,
  );
});
