import assert from "node:assert/strict";
import test from "node:test";
import { createAgentConversationIndex } from "../../src/application/agent-conversation-index.ts";

test("warm conversations are qualified by agent identity, including punctuation", () => {
  const index = createAgentConversationIndex();
  index.remember({ name: "claude" }, "same-id");
  assert.ok(index.has({ name: "claude" }, "same-id"));
  assert.equal(index.has({ name: "codex" }, "same-id"), false);
  index.remember({ name: "a:b" }, "c");
  assert.equal(index.has({ name: "a" }, "b:c"), false);
});
