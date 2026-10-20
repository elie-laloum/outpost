import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createSteering, dispatch } from "../src/index.ts";

export async function validateSteering({
  common,
  workspace,
  sandboxProvider,
  record,
  response,
}) {
  assert.ok(!common.agent.liveInput, "This suite validates resume steering");
  const token = randomUUID();
  const steering = createSteering();
  let delivery;
  const modes = [];
  record.step = "steer-during-tool";
  try {
    const result = await dispatch({
      ...common,
      workspace,
      sandboxProvider,
      steering,
      brief: {
        text: "This is a file workspace without Git. Do not inspect credentials or environment variables. First write before followed by a newline into before-steer.txt, then run sleep 5. A subsequent user instruction will supply a token and file task. Follow it and return that token as answer. If no instruction arrives yet, answer WAITING.",
      },
      response: response(token),
      observe(event) {
        if (event.kind === "tool" && !delivery) {
          delivery = steering.send(
            `The token is ${token}. Keep existing files. Write the token followed by a newline into steered.txt, then return it as answer.`,
          );
          void delivery.catch(() => {});
        }
        if (event.kind === "steer") modes.push(event.mode);
      },
    });
    record.turns = result.turns.length;
    record.step = "verify-resumed-delivery";
    assert.ok(delivery, "Expected a tool event before sending steering");
    assert.deepEqual(await delivery, { mode: "resumed" });
    assert.deepEqual(modes, ["resumed"]);
    assert.equal(result.completed, true);
    assert.equal(result.turns.length, 2);
    assert.equal(record.versions.length, 1, "Steering must reuse one sandbox");
    assert.equal(result.turns[1].status, 0);
    assert.ok(result.turns[0].conversation);
    assert.equal(result.turns[1].conversation, result.turns[0].conversation);
    assert.equal(
      await readFile(join(workspace.directory, "steered.txt"), "utf8"),
      `${token}\n`,
    );
    assert.equal(JSON.parse(result.report()).version, 2);
    record.interrupted = result.turns[0].interrupted === "steering";
    record.usage = result.usage;
    record.checks.push(
      "tool-triggered-input",
      "resumed-steering",
      "same-conversation",
      "same-sandbox",
      "steered-file",
      "typed-json",
      "report-v2",
    );
  } finally {
    steering.close();
  }
}
