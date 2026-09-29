import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  agent,
  createSandbox,
  createSteering,
  defineHarnessTool,
  dispatch,
  harness,
  OutpostError,
  type AgentObservation,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
  type SteeringDelivery,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const done = "<outpost>done</outpost>";
type Reply = (request: ModelRequest) => ModelResult;

const provider = (
  replies: Reply[],
  requests: ModelRequest[],
): ModelProvider => ({
  name: "scripted",
  async request(request) {
    requests.push(request);
    const reply = replies.shift();
    assert.ok(reply, "unexpected model request");
    return reply(request);
  },
});
const answer =
  (text = done): Reply =>
  () => ({ text, content: [{ type: "text", text }], stopReason: "end" });
const lastUser = (request: ModelRequest | undefined) =>
  (request?.messages?.at(-1)?.content ?? []).map((block) =>
    block.type === "text" ? block.text : block.type,
  );

test("steering injects instructions between built-in harness steps and persists them", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const deliveries: Promise<SteeringDelivery>[] = [];
  const inspect = defineHarnessTool({
    name: "inspect",
    description: "Inspect the repository.",
    input: { type: "object", properties: {} },
    execute: () => {
      deliveries.push(steering.send("Leave legacy/ untouched."));
      return "inspected";
    },
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: "m",
      harness: harness({
        modelProvider: provider(
          [
            () => ({
              text: "",
              content: [
                { type: "tool-call", id: "c1", name: "inspect", input: {} },
              ],
              stopReason: "tool-calls",
            }),
            (request) => {
              deliveries.push(steering.send("Also update the changelog."));
              return answer("Finished the refactor.")(request);
            },
            answer(),
          ],
          requests,
        ),
        tools: [inspect],
      }),
    }),
    brief: { text: "Refactor the auth module" },
    steering,
    observe: (event) => events.push(event),
  });
  assert.equal(result.completed, true);
  assert.equal(result.turns.length, 1);
  assert.deepEqual(await Promise.all(deliveries), [
    { mode: "injected" },
    { mode: "injected" },
  ]);
  assert.deepEqual(lastUser(requests[1]), [
    "tool-result",
    "Leave legacy/ untouched.",
  ]);
  assert.deepEqual(lastUser(requests[2]), ["Also update the changelog."]);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "steer")
      .map((event) => [event.text, event.mode, event.pass]),
    [
      ["Leave legacy/ untouched.", "injected", 1],
      ["Also update the changelog.", "injected", 1],
    ],
  );
  assert.ok(result.transcript);
  const transcript = await readFile(result.transcript, "utf8");
  assert.match(transcript, /Leave legacy\/ untouched\./);
  assert.match(transcript, /Also update the changelog\./);
  assert.equal(steering.state, "idle");
});

test("steering that arrives after the harness answered resumes its conversation", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const requests: ModelRequest[] = [];
  let late: Promise<SteeringDelivery> | undefined;
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: "m",
      harness: harness({
        modelProvider: provider([answer("First answer."), answer()], requests),
      }),
    }),
    brief: { text: "Summarize" },
    steering,
    observe(event) {
      if (event.kind === "result" && !late)
        late = steering.send("Mention the tests too.");
    },
  });
  assert.deepEqual(await late, { mode: "resumed" });
  assert.equal(result.turns.length, 2);
  assert.equal(result.turns[0]!.interrupted, undefined);
  assert.equal(result.turns[1]!.conversation, result.turns[0]!.conversation);
  assert.equal(result.completed, true);
  const history = requests[1]!.messages!.flatMap((message) =>
    message.content.flatMap((block) =>
      block.type === "text" ? [block.text] : [],
    ),
  );
  assert.deepEqual(history.slice(-2), [
    "First answer.",
    "Mention the tests too.",
  ]);
});

test("steering interrupts a resumable CLI agent and resumes its conversation", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const events: AgentObservation[] = [];
  const inputs: { text?: string; continuation?: string }[] = [];
  let delivery: Promise<SteeringDelivery> | undefined;
  const coder = scripted((input) => {
    inputs.push({
      ...(input.text === undefined ? {} : { text: input.text }),
      ...(input.continuation ? { continuation: input.continuation.id } : {}),
    });
    return input.continuation
      ? `${emit(`resumed with ${input.continuation.id} ${done}`)}`
      : `console.log(JSON.stringify({kind:"conversation",id:"conv-1"}));setInterval(()=>{},1000);`;
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: coder,
    brief: { text: "Refactor the auth module" },
    steering,
    observe(event) {
      events.push(event);
      if (event.kind === "conversation" && !delivery)
        delivery = steering.send("Leave legacy/ untouched.");
    },
  });
  assert.deepEqual(await delivery, { mode: "resumed" });
  assert.equal(result.completed, true);
  assert.equal(result.turns.length, 2);
  assert.equal(result.turns[0]!.interrupted, "steering");
  assert.equal(result.turns[0]!.conversation, "conv-1");
  assert.deepEqual(inputs.at(-1), {
    text: "Leave legacy/ untouched.",
    continuation: "conv-1",
  });
  assert.ok(
    events.some(
      (event) => event.kind === "stopped" && event.reason === "steered",
    ),
  );
  assert.deepEqual(
    events
      .filter((event) => event.kind === "steer")
      .map((event) => [event.mode, event.pass]),
    [["resumed", 1]],
  );
  assert.equal(events.filter((event) => event.kind === "summary").length, 1);
});

test("steering sent before a turn starts joins its prompt", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const early = steering.send("Prefer small commits.");
  const box = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(
      `let text='';process.stdin.on('data',d=>text+=d);process.stdin.on('end',()=>console.log(JSON.stringify({kind:'text',text:text+' ${done}'})));`,
    ),
  });
  try {
    const result = await box.dispatch({
      brief: { text: "Refactor" },
      steering,
    });
    assert.deepEqual(await early, { mode: "injected" });
    assert.match(result.text, /Refactor[\s\S]*\n\nPrefer small commits\./);
    const second = await box.dispatch({ brief: { text: "Again" }, steering });
    assert.equal(second.turns.length, 1);
  } finally {
    await box.close();
  }
});

test("steering rejects messages that no turn could deliver and agents that cannot be steered", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  let undelivered: Promise<SteeringDelivery> | undefined;
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(
      `setTimeout(()=>console.log(${JSON.stringify(JSON.stringify({ kind: "text", text: done }))}),200);`,
    ),
    brief: { text: "Work" },
    steering,
    observe(event) {
      if (event.kind === "prompt")
        setTimeout(() => (undelivered = steering.send("No conversation")), 50);
    },
  });
  assert.equal(result.turns.length, 1);
  await assert.rejects(
    undelivered!,
    (error: unknown) =>
      error instanceof OutpostError && error.code === "steering",
  );
  const fixed = { ...scripted(emit(done)), resumable: false };
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent: fixed,
      brief: { text: "Work" },
      steering: createSteering(),
    }),
    /cannot be steered/,
  );
  const busy = createSteering();
  const box = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: scripted(
      `setTimeout(()=>console.log(${JSON.stringify(JSON.stringify({ kind: "text", text: done }))}),100);`,
    ),
  });
  try {
    const first = box.dispatch({ brief: { text: "One" }, steering: busy });
    await assert.rejects(
      box.dispatch({ brief: { text: "Two" }, steering: busy }),
      /already attached/,
    );
    await first;
  } finally {
    await box.close();
  }
});
