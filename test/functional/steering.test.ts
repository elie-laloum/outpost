import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  agent,
  claudeHarness,
  codexHarness,
  createSandbox,
  createSteering,
  defineHarnessSubagent,
  defineHarnessTool,
  dispatch,
  harness,
  OutpostError,
  readJournal,
  replayAgent,
  type AgentInput,
  type AgentObservation,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
  type SteeringDelivery,
} from "../../src/index.ts";
import { git } from "../../src/infrastructure/git.ts";
import { repositoryTransport } from "../../src/infrastructure/repository-transport.ts";
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

const claudeFixture = fileURLToPath(
  new URL("../fixtures/claude-stream-input.ts", import.meta.url),
);

function streamingClaude(calls: (readonly string[])[]) {
  const native = agent({
    harness: claudeHarness({ saveConversations: false }),
  });
  assert.equal(native.kind, "cli");
  return {
    ...native,
    request(input: AgentInput) {
      const command = native.request(input);
      calls.push(command.arguments ?? []);
      return {
        ...command,
        executable: process.execPath,
        arguments: [claudeFixture, ...(command.arguments ?? [])],
      };
    },
  };
}

test("Claude receives steering on live stdin during a tool call and exits after its result", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const calls: (readonly string[])[] = [];
  const events: AgentObservation[] = [];
  let delivery: Promise<SteeringDelivery> | undefined;
  const started = Date.now();
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: streamingClaude(calls),
    brief: { text: "Please use a tool" },
    steering,
    settleMs: 30_000,
    observe(event) {
      events.push(event);
      if (event.kind === "tool" && !delivery)
        delivery = steering.send("Leave legacy/ untouched.");
    },
  });
  assert.deepEqual(await delivery, { mode: "injected" });
  assert.ok(Date.now() - started < 20_000, "stdin was closed after the result");
  assert.equal(result.turns.length, 1);
  assert.equal(result.completed, true);
  assert.match(result.text, /injected: Leave legacy\/ untouched\./);
  assert.equal(calls.length, 1);
  assert.ok(calls[0]!.includes("--replay-user-messages"));
  assert.equal(
    calls[0]![calls[0]!.indexOf("--input-format") + 1],
    "stream-json",
  );
  assert.ok(
    !events.some(
      (event) => event.kind === "text" && event.text === "Please use a tool",
    ),
    "replayed user messages are not agent text",
  );
});

test("Claude processes steering queued during its final answer before stdin closes", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const calls: (readonly string[])[] = [];
  let delivery: Promise<SteeringDelivery> | undefined;
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: streamingClaude(calls),
    brief: { text: "Answer directly" },
    steering,
    settleMs: 30_000,
    observe(event) {
      if (event.kind === "text" && !delivery)
        delivery = steering.send("Also update the changelog.");
    },
  });
  assert.deepEqual(await delivery, { mode: "injected" });
  assert.equal(calls.length, 1);
  assert.equal(result.turns.length, 1);
  assert.match(result.text, /handled: Answer directly/);
  assert.match(result.text, /handled: Also update the changelog\./);
});

test("Claude steering after stdin closed resumes the native session", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const calls: (readonly string[])[] = [];
  let delivery: Promise<SteeringDelivery> | undefined;
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: streamingClaude(calls),
    brief: { text: "Answer directly" },
    steering,
    settleMs: 30_000,
    observe(event) {
      if (event.kind === "finished" && !delivery)
        delivery = steering.send("Mention the tests.");
    },
  });
  assert.deepEqual(await delivery, { mode: "resumed" });
  assert.equal(calls.length, 2);
  assert.deepEqual(
    calls[1]!.slice(
      calls[1]!.indexOf("--resume"),
      calls[1]!.indexOf("--resume") + 2,
    ),
    ["--resume", "steer-session"],
  );
  assert.equal(result.turns.length, 2);
  assert.match(result.turns[1]!.text, /handled: Mention the tests\./);
});

test("steering reaches the built-in subagent that is working", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const parentRequests: ModelRequest[] = [];
  const childRequests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  let delivery: Promise<SteeringDelivery> | undefined;
  const probe = defineHarnessTool({
    name: "probe",
    description: "Probe the fixture.",
    input: { type: "object", properties: {} },
    execute: () => {
      delivery = steering.send("Only inspect src/.");
      return "probed";
    },
  });
  const child = agent({
    model: "child",
    harness: harness({
      modelProvider: provider(
        [
          () => ({
            text: "",
            content: [
              { type: "tool-call", id: "p1", name: "probe", input: {} },
            ],
            stopReason: "tool-calls",
          }),
          answer("Inspected src/."),
        ],
        childRequests,
      ),
      tools: [probe],
    }),
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: "parent",
      harness: harness({
        modelProvider: provider(
          [
            () => ({
              text: "",
              content: [
                {
                  type: "tool-call",
                  id: "d1",
                  name: "inspect",
                  input: { prompt: "Inspect the repository" },
                },
              ],
              stopReason: "tool-calls",
            }),
            answer(),
          ],
          parentRequests,
        ),
        tools: [
          defineHarnessSubagent({
            name: "inspect",
            description: "Inspect the repository.",
            agent: child,
          }),
        ],
      }),
    }),
    brief: { text: "Review" },
    steering,
    observe: (event) => events.push(event),
  });
  assert.equal(result.completed, true);
  assert.deepEqual(await delivery, { mode: "injected" });
  assert.deepEqual(lastUser(childRequests[1]), [
    "tool-result",
    "Only inspect src/.",
  ]);
  assert.ok(
    parentRequests.every(
      (request) => !JSON.stringify(request.messages).includes("Only inspect"),
    ),
  );
  const steer = events.find((event) => event.kind === "steer");
  assert.equal(steer?.kind === "steer" && steer.mode, "injected");
  assert.ok(steer?.subagentId);
});

test("replay reproduces a steered run's turns, instructions, text, usage and commits", async (t) => {
  const root = await repository(t);
  const baseline = (await git(root, ["rev-parse", "HEAD"])).trim();
  const steering = createSteering();
  const events: AgentObservation[] = [];
  let sent = false;
  const commit = (file: string) =>
    `const {writeFileSync}=await import('node:fs');const {execFileSync}=await import('node:child_process');writeFileSync('${file}','${file}\\n');execFileSync('git',['add','.']);execFileSync('git',['commit','-m','${file}']);`;
  const coder = scripted((input) =>
    input.continuation
      ? `${commit("second.txt")}console.log(JSON.stringify({kind:'usage',tokens:{input:7,cached:0,output:3}}));${emit(`resumed ${done}`)}`
      : `${commit("first.txt")}console.log(JSON.stringify({kind:'usage',tokens:{input:5,cached:1,output:2}}));${emit("partial")}console.log(JSON.stringify({kind:'conversation',id:'conv-r'}));setInterval(()=>{},1000);`,
  );
  const recorded = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: coder,
    brief: { text: "work" },
    steering,
    logging: { replayable: true },
    observe(event) {
      events.push(event);
      if (event.kind === "conversation" && !sent) {
        sent = true;
        void steering.send("Also add second.txt");
      }
    },
  });
  assert.equal(recorded.turns.length, 2);
  assert.ok(recorded.logReference);
  const journal = await readJournal({
    transporter: repositoryTransport(root),
    reference: recorded.logReference,
  });
  const replaying = replayAgent({ journal });
  assert.equal(replaying.turns.length, 2);
  await git(root, ["reset", "--hard", baseline]);
  const replayedEvents: AgentObservation[] = [];
  const replayed = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: replaying,
    brief: { text: "work" },
    observe: (event) => replayedEvents.push(event),
  });
  assert.equal(replaying.remainingTurns, 0);
  assert.deepEqual(
    replayed.turns.map((turn) => [turn.text, turn.interrupted, turn.usage]),
    recorded.turns.map((turn) => [turn.text, turn.interrupted, turn.usage]),
  );
  assert.equal(replayed.text, recorded.text);
  assert.deepEqual(replayed.usage, recorded.usage);
  assert.deepEqual(
    replayed.commits.map((commit) => commit.subject),
    recorded.commits.map((commit) => commit.subject),
  );
  const kinds = (list: AgentObservation[]) =>
    list
      .filter((event) => ["steer", "stopped", "summary"].includes(event.kind))
      .map((event) =>
        event.kind === "steer"
          ? [event.kind, event.text, event.mode]
          : [event.kind],
      );
  assert.deepEqual(kinds(replayedEvents), kinds(events));
});

const codexFixture = fileURLToPath(
  new URL("../fixtures/codex-app-server.ts", import.meta.url),
);

function appServerCodex(calls: (readonly string[])[]) {
  const native = agent({ harness: codexHarness({ saveConversations: false }) });
  assert.equal(native.kind, "cli");
  return {
    ...native,
    request(input: AgentInput) {
      const command = native.request(input);
      calls.push(command.arguments ?? []);
      return input.liveInput
        ? {
            ...command,
            executable: process.execPath,
            arguments: [codexFixture, ...(command.arguments ?? [])],
          }
        : command;
    },
  };
}

test("Codex receives steering through app-server turn/steer during a tool call", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const calls: (readonly string[])[] = [];
  const events: AgentObservation[] = [];
  let delivery: Promise<SteeringDelivery> | undefined;
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: appServerCodex(calls),
    brief: { text: "Please use a tool" },
    steering,
    settleMs: 30_000,
    observe(event) {
      events.push(event);
      if (event.kind === "tool" && !delivery)
        delivery = steering.send("Leave legacy/ untouched.");
    },
  });
  assert.deepEqual(await delivery, { mode: "injected" });
  assert.deepEqual(calls, [["app-server"]]);
  assert.equal(result.turns.length, 1);
  assert.equal(result.completed, true);
  assert.equal(result.conversation, "thread-1");
  assert.match(result.text, /injected: Leave legacy\/ untouched\./);
  assert.deepEqual(result.usage, {
    input: 10,
    cached: 4,
    cacheCreated: 0,
    output: 2,
  });
  assert.ok(!events.some((event) => event.kind === "failure"));
});

test("Codex steering after its turn completed resumes the app-server thread", async (t) => {
  const root = await repository(t);
  const steering = createSteering();
  const calls: (readonly string[])[] = [];
  let delivery: Promise<SteeringDelivery> | undefined;
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: appServerCodex(calls),
    brief: { text: "Answer directly" },
    steering,
    settleMs: 30_000,
    observe(event) {
      if (event.kind === "finished" && !delivery)
        delivery = steering.send("Mention the tests.");
    },
  });
  assert.deepEqual(await delivery, { mode: "resumed" });
  assert.equal(calls.length, 2);
  assert.equal(result.turns.length, 2);
  assert.equal(result.turns[1]!.conversation, "thread-1");
  assert.match(result.turns[1]!.text, /handled: Mention the tests\./);
});
