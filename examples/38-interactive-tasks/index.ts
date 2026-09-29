// Interactive tasks — the agent asks questions while it works.
// Each question ends its turn: the conversation is captured, the sandbox released,
// the question persisted. An answer, even in another process, starts the next turn.

import { readFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineInteractiveAgentTask,
  defineTask,
  defineWorkflow,
  type WorkflowInputRequest,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });

const assistant = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});


// 1. The dialogue: Outpost teaches the agent how to ask a question or finish.
const clarify = defineInteractiveAgentTask({
  key: "clarify",
  repository: demoRepository(import.meta.dirname),
  agent: assistant,
  sandboxProvider,
  brief: readFileSync(join(import.meta.dirname, "clarify.md"), "utf8"),
  actors: ["owner"], // who may answer (your application authenticates them)
  maxTurns: 5,       // the final answer included
  timeoutMs: 120_000, // per turn, not the time spent waiting for you
});

// 2. A dependent task: blocked as long as the dialogue waits.
const summary = defineTask({
  key: "summary",
  after: [clarify],
  perform: (context) => {
    const { output, turns } = context.value(clarify);
    return { spec: output, turns };
  },
});

const plan = defineWorkflow("discovery", [clarify, summary]);

const checkpoint = {
  store: createWorkflowCheckpointStore({ transporter: createLocalTransport({ directory: state }) }),
  runId: "discovery-1",
  version: "1",
};


// 3. The conversation loop, on the application side.
const terminal = createInterface({ input: process.stdin, output: process.stdout });

async function ask(request: WorkflowInputRequest) {
  console.log(`\n🤖 ${request.question}`);
  request.choices?.forEach((choice, index) => console.log(`   ${index + 1}. ${choice}`));
  if (request.allowFreeText === false) console.log("   (un des choix uniquement)");

  const typed = (await terminal.question("> ")).trim();
  const picked = request.choices?.[Number(typed) - 1];

  return {
    executionId: request.executionId,
    key: request.key,
    requestId: request.id,
    actor: "owner",
    value: picked ?? typed,
  };
}

let result = await plan.start({ checkpoint });

while (result.status === "waiting-input") {
  console.log(`(${result.tasks.map((record) => `${record.key}=${record.status}`).join(", ")})`);

  const answers = [];
  for (const request of result.inputRequests) answers.push(await ask(request));

  // Every answer is validated before any is applied: a refused batch changes nothing.
  try {
    result = await plan.start({ checkpoint, answers });
  } catch (error) {
    console.log("⛔ réponse refusée :", (error as Error).message);
  }
}

terminal.close();
result.unwrap();


// 4. The result: plain JSON, no live sandbox; the worktree is kept on its branch.
const clarified = result.value(clarify);

console.log("\nspécification :", JSON.stringify(result.value(summary).spec, null, 2));
console.log("tours :", clarified.turns, "— conversation :", clarified.conversation);
console.log("branche conservée :", clarified.branch);
