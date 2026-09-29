import assert from "node:assert/strict";
import { test } from "node:test";
import {
  harness,
  harnessConversations,
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
