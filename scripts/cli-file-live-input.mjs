import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createSteering, dispatch } from "../src/index.ts";

export async function validateLiveInput({
  common,
  workspace,
  sandboxProvider,
  record,
  response,
  checkResult,
}) {
  assert.ok(
    common.agent.liveInput,
    "The adapter must implement native live input",
  );
  const token = randomUUID();
  const steering = createSteering();
  let delivery;
  let injected = 0;
  let resumed = 0;
  record.step = "inject-during-tool";
  try {
    const result = await dispatch({
      ...common,
      workspace,
      sandboxProvider,
      steering,
      brief: {
        text: "This is a file workspace without Git. Do not inspect credentials or environment variables. First run the shell command sleep 3. A subsequent user instruction will supply a token and file task during that command. Follow it and return that token as answer. Do not invent a token.",
      },
      response: response(token),
      observe(event) {
        if (event.kind === "tool" && !delivery) {
          delivery = steering.send(
            `The token is ${token}. Write it followed by a newline into steered.txt in the working directory, then return it as answer.`,
          );
          void delivery.catch(() => {});
        }
        if (event.kind === "steer" && event.mode === "injected") injected++;
        if (event.kind === "steer" && event.mode === "resumed") resumed++;
      },
    });
    record.turns = result.turns.length;
    record.step = "verify-live-delivery";
    checkResult(result, 1);
    assert.ok(delivery, "Expected a tool event before sending steering");
    assert.deepEqual(await delivery, { mode: "injected" });
    assert.equal(injected, 1);
    assert.equal(resumed, 0);
    assert.equal(result.turns[0].interrupted, undefined);
    assert.equal(
      await readFile(join(workspace.directory, "steered.txt"), "utf8"),
      `${token}\n`,
    );
    record.usage = result.usage;
    record.checks.push(
      "tool-triggered-input",
      "native-live-injection",
      "single-cli-turn",
      "no-interrupt-or-resume",
      "steered-file",
      "typed-json",
      "report-v2",
    );
  } finally {
    steering.close();
  }
}
