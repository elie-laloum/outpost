// Approvals — the workflow stops and waits for an explicit human decision.
// The pause is persisted: no process stays blocked while waiting.

import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import {
  createAgent,
  createHarness,
  createHarnessShellTools,
  createLocalTransport,
  createReporter,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineTask,
  defineTextResponse,
  defineWorkflow,
  dispatch,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

const repository = demoRepository(import.meta.dirname);
const state = join(import.meta.dirname, "state");

const writer = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessShellTools()] }),
});

// 1. The agent drafts release notes.
const draft = defineTask({
  key: "draft",
  perform: async () => {
    const result = await dispatch({
      repository,
      sandboxProvider,
      agent: writer,
      brief: { file: join(import.meta.dirname, "brief.md") },
      response: defineTextResponse({ tag: "notes" }), // the text between <notes> and </notes>
    });

    return result.value;
  },
});

// 2. A human must approve.
const review = defineApprovalTask({
  key: "review",
  after: [draft],
  prompt: "Publish these release notes?",
  actors: ["demo-reviewer"],
});

// 3. Publish, only if approved.
//    The task returns plain text: a checkpointed value must be JSON.
const publish = defineTask({
  key: "publish",
  after: [draft, review],
  perform: async (context) => {
    const result = await dispatch({
      repository,
      sandboxProvider,
      agent: writer,
      brief: {
        file: join(import.meta.dirname, "publish.md"),
        values: { notes: context.value(draft) },
      },
      observe: createReporter({ label: "publish" }),
    });

    return result.text;
  },
});

const plan = defineWorkflow("release-notes", [draft, review, publish]);

const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({ directory: state }),
  }),
  runId: randomUUID(),
  version: "1",
};

// First start: the draft is written, then the workflow pauses.
const paused = await plan.start({ checkpoint });
const request = paused.tasks.find((record) => record.key === review.key)?.pause;

console.log("statut :", paused.status); // "paused"
console.log(paused.value(draft));

// The decision arrives (here from the terminal; in a real app, from an authenticated human).
const terminal = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const answer = await terminal.question(`${request!.prompt} (o/n) `);
terminal.close();

// Second start: submit the decision; the workflow resumes where it left off.
const decided = await plan.start({
  checkpoint,
  decisions: [
    {
      executionId: paused.executionId,
      key: review.key,
      requestId: request!.id,
      action: answer === "o" ? "approve" : "reject",
      actor: "demo-reviewer",
      reason: "Decided in the terminal",
    },
  ],
});

console.log("statut :", decided.status); // "done" if approved, "failed" if rejected
