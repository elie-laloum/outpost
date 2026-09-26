import assert from "node:assert/strict";
import { test } from "node:test";
import {
  replayable,
  requestMessages,
  validateMessages,
} from "../../src/domain/model-messages.ts";
import type { ModelMessage } from "../../src/index.ts";

const user = (text = "go"): ModelMessage => ({
  role: "user",
  content: [{ type: "text", text }],
});
const call = (id: string): ModelMessage => ({
  role: "assistant",
  content: [{ type: "tool-call", id, name: "read", input: {} }],
});
const result = (...ids: string[]): ModelMessage => ({
  role: "user",
  content: ids.map((callId) => ({
    type: "tool-result" as const,
    callId,
    content: "ok",
  })),
});

test("request messages accept a prompt shorthand or paired tool history", () => {
  assert.deepEqual(requestMessages({ model: "m", prompt: "hi" }), [user("hi")]);
  const history = [user(), call("a"), result("a")];
  assert.equal(requestMessages({ model: "m", messages: history }), history);
  assert.throws(
    () => requestMessages({ model: "m", prompt: "hi", messages: history }),
    /exactly one/,
  );
  assert.throws(() => requestMessages({ model: "m" }), /exactly one/);
  assert.throws(() => requestMessages({ model: "m", prompt: " " }), /prompt/);
});

test("message validation enforces roles, blocks and tool pairing", () => {
  for (const [messages, pattern] of [
    [[], /nonempty/],
    [[{ role: "system", content: [{ type: "text", text: "x" }] }], /role/],
    [[{ role: "user", content: [] }], /role/],
    [[call("a")], /start and end/],
    [[user(), call("a")], /start and end/],
    [[user(), call("a"), user()], /exactly one result/],
    [[user(), call("a"), result("a", "a")], /exactly one result/],
    [[user(), call("a"), result("b")], /exactly one result/],
    [[result("a")], /exactly one result/],
    [[{ role: "user", content: [{ type: "image" }] }], /Unsupported/],
    [[{ role: "user", content: [{ type: "text", text: 1 }] }], /Invalid text/],
    [
      [{ role: "user", content: [{ type: "tool-call", id: "a", name: "x" }] }],
      /Invalid tool-call block in a user/,
    ],
    [
      [
        user(),
        {
          role: "assistant",
          content: [{ type: "tool-call", id: "a", name: "bad name" }],
        },
        result("a"),
      ],
      /Invalid tool-call/,
    ],
    [
      [
        user(),
        { role: "assistant", content: [{ type: "reasoning", provider: "" }] },
        user(),
      ],
      /Invalid reasoning/,
    ],
    [
      [
        {
          role: "user",
          content: [
            { type: "tool-result", callId: "a", content: "x", isError: 1 },
          ],
        },
      ],
      /Invalid tool-result/,
    ],
  ] as const)
    assert.throws(
      () => validateMessages(messages as unknown as ModelMessage[]),
      pattern,
    );
});

test("reasoning blocks replay only to their provider identity and model", () => {
  const block = {
    type: "reasoning" as const,
    provider: "p",
    model: "m",
    data: {},
  };
  assert.equal(replayable(block, "p", "m"), true);
  assert.equal(replayable(block, "q", "m"), false);
  assert.equal(replayable(block, "p", "n"), false);
  assert.equal(replayable({ type: "text", text: "x" }, "q", "n"), true);
});
