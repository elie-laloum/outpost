import assert from "node:assert/strict";
import { test } from "node:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createSandbox,
  createSteering,
  createReplayAgent,
  defineJsonResponse,
  defineTextResponse,
  dispatch,
  readJournal,
} from "../../src/index.ts";
import type {
  AgentInput,
  AgentObservation,
  SteeringDelivery,
} from "../../src/index.ts";
import { repositoryTransport } from "../../src/infrastructure/repository-transport.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const verdict = defineJsonResponse({
  tag: "verdict",
  schema: {
    "~standard": {
      validate(input) {
        assert.ok(
          input &&
            typeof input === "object" &&
            "approved" in input &&
            typeof input.approved === "boolean" &&
            "reasons" in input &&
            Array.isArray(input.reasons),
        );
        return { value: { approved: input.approved, reasons: input.reasons } };
      },
      jsonSchema: {
        input() {
          return {
            type: "object",
            properties: {
              approved: { type: "boolean" },
              reasons: { type: "array", items: { type: "string" } },
            },
            required: ["approved", "reasons"],
          };
        },
      },
    },
  },
});
const answer =
  '<verdict>{"approved":false,"reasons":["Missing test"]}</verdict>';
const conversation =
  'console.log(JSON.stringify({kind:"conversation",id:"response-c1"}));';

test("plain briefs receive the contract after steering and record the exact sent prompt", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const queued = steering.send("Use Markdown for the final answer.");
  let late: Promise<SteeringDelivery> | undefined;
  const inputs: AgentInput[] = [];
  const events: AgentObservation[] = [];
  const agent = scripted((input) => {
    inputs.push(input);
    return conversation + emit(answer);
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent,
    brief: { text: "Review this" },
    response: verdict,
    steering,
    logging: { replayable: true },
    observe(event) {
      events.push(event);
      if (event.kind === "text" && !late)
        late = steering.send("Mention the missing test.");
    },
  });
  assert.deepEqual(result.value, {
    approved: false,
    reasons: ["Missing test"],
  });
  assert.equal(inputs.length, 2);
  assert.equal((await queued).mode, "injected");
  assert.equal((await late)?.mode, "resumed");
  assert.ok(inputs[0]!.text!.startsWith("Review this\n\nUse Markdown"));
  assert.ok(
    inputs[0]!.text!.indexOf("Final response format:") >
      inputs[0]!.text!.indexOf("Use Markdown"),
  );
  assert.ok(
    inputs[1]!.text!.startsWith(
      "Mention the missing test.\n\nFinal response format:",
    ),
  );
  assert.ok(
    inputs.every(
      (input) =>
        input.text?.includes('"approved"') && input.text.includes('"reasons"'),
    ),
  );
  assert.deepEqual(
    events
      .filter((event) => event.kind === "prompt")
      .map((event) => event.text),
    inputs.map((input) => input.text),
  );
  assert.ok(result.logReference);
  const journal = await readJournal({
    transporter: repositoryTransport(root),
    reference: result.logReference,
  });
  const replay = createReplayAgent({ journal });
  assert.equal(replay.turns.length, 2);
  assert.deepEqual(
    replay.turns.map((turn) => turn.prompt),
    inputs.map((input) => input.text),
  );
  const replayed = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: replay,
    brief: { text: "Review this\n\nUse Markdown for the final answer." },
    response: verdict,
    logging: false,
  });
  assert.deepEqual(replayed.value, result.value);
  assert.equal(replay.remainingTurns, 0);
});

test("file expansion runs before injection and schema text never expands commands", async (t) => {
  const root = await repository(t);
  const file = join(root, "brief.md");
  await writeFile(file, "Review {{subject}}\n!`printf rendered`");
  const response = defineJsonResponse({
    tag: "value",
    schema: (input) => input,
    jsonSchema: { type: "string", description: "{{MISSING}} !`exit 42`" },
  });
  let prompt = "";
  const result = await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    response,
    brief: { file, values: { subject: "README" } },
    logging: false,
    agent: scripted((input) => {
      prompt = input.text!;
      return emit('<value>"ok"</value>');
    }),
  });
  assert.equal(result.value, "ok");
  assert.ok(
    prompt.startsWith("Review README\nrendered\n\nFinal response format:"),
  );
  assert.match(prompt, /\{\{MISSING\}\} !`exit 42`/);
});

test("repairs, continuations and forks keep format instructions without rewriting the brief", async (t) => {
  const root = await repository(t);
  const inputs: AgentInput[] = [];
  const agent = scripted((input) => {
    inputs.push(input);
    return conversation + emit(inputs.length === 1 ? "invalid" : answer);
  });
  const box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent,
    logging: false,
  });
  t.after(() => box.close());
  const brief = { text: "Review this" };
  const first = await box.dispatch({
    brief,
    response: { ...verdict, repairs: 1 },
  });
  assert.equal(brief.text, "Review this");
  assert.match(inputs[1]!.text!, /Validation failure:/);
  assert.match(inputs[1]!.text!, /Do not edit files, run commands/);
  assert.equal(inputs[1]!.continuation?.id, first.conversation);
  await first.resume({ brief: { text: "Review again" }, response: verdict });
  await first.fork({ brief: { text: "Review a copy" }, response: verdict });
  assert.ok(
    inputs.every(
      (input) =>
        input.text?.includes("Final response format:") &&
        input.text.includes('"approved"'),
    ),
  );
  assert.equal(inputs[3]!.continuation?.fork, true);
});

test("text contracts inject tags and dispatches without response preserve their prompt", async (t) => {
  const root = await repository(t);
  const prompts: string[] = [];
  const agent = scripted((input) => {
    prompts.push(input.text!);
    return emit("<summary>ok</summary>");
  });
  const box = await createSandbox({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent,
    logging: false,
  });
  t.after(() => box.close());
  assert.equal(
    (
      await box.dispatch({
        brief: { text: "Summarize" },
        response: defineTextResponse({ tag: "summary" }),
      })
    ).value,
    "ok",
  );
  await box.dispatch({ brief: { text: "unchanged" } });
  assert.match(prompts[0]!, /requested text/);
  assert.equal(prompts[1], "unchanged");
});

test("legacy contracts get generic tags and invalid JSON metadata fails before allocation", async (t) => {
  const root = await repository(t);
  let prompt = "";
  const custom = {
    tag: "custom",
    repairs: 0,
    read: async (text: string) => text,
  };
  await dispatch({
    repository: root,
    sandboxProvider: createLocalSandboxProvider(),
    agent: scripted((input) => {
      prompt = input.text!;
      return emit("custom output");
    }),
    brief: { text: "Write a summary" },
    response: custom,
    logging: false,
  });
  assert.match(prompt, /<custom>/);
  assert.doesNotMatch(prompt, /valid JSON/);
  let acquired = false;
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: {
        ...createLocalSandboxProvider(),
        async acquire() {
          acquired = true;
          throw new Error("Unexpected allocation");
        },
      },
      agent: scripted(emit("unused")),
      brief: { text: "Review this" },
      response: { ...custom, format: "json" },
      logging: false,
    }),
    /Response JSON Schema must be an object/,
  );
  assert.equal(acquired, false);
});
