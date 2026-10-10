---
title: "Clarify and approve a change"
description: "Ask for missing requirements, inspect the plan and record a human decision."
---

This example turns a ticket into a plan you can review before permitting implementation. The agent asks for missing information; a separate approval gate decides whether work may continue. The brief asks for planning only; it does not enforce read-only access.

Use the [agent configuration](../setup/) and install the response validator with `npm install zod`. Save every file below in one script directory. Replace the sample ticket with a task relevant to your repository, and use a new ticket key for a new run.

[Download all files](../../guide-examples/plan-a-change.tar.gz). Extract into a dedicated directory, run `npm install`, then adapt `outpost.config.ts` using [Installation](../setup/). The commands below identify the scripts to run.

## Clarify the ticket and approve the plan

Start with the ticket, its expected plan and the approval gate.

<!-- tabs -->

```ts title="ticket.ts"
import { z } from "zod";

export const ticket = {
  key: "SHOP-142",
  text: "Add a CSV export to the orders list.",
};
export const planSchema = z.object({
  summary: z.string().min(1),
  tests: z.array(z.string()).min(1),
  code: z.array(z.string()).min(1),
});
```

```ts title="frame.ts"
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
import { repository, coder, sandboxProvider } from "./outpost.config.ts";
import { ticket } from "./ticket.ts";

export const frame = defineInteractiveAgentTask({
  key: "frame",
  repository,
  agent: coder,
  sandboxProvider,
  brief: [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Read the code without editing or committing. Then ask the owner about what the ticket leaves open, one point at a time.",
    'When nothing is ambiguous, complete with {"summary": string, "tests": string[], "code": string[]}:',
    "the behaviors to test, then the changes to make.",
  ].join("\n"),
  actors: ["owner"],
  maxTurns: 10,
});
```

```ts title="plan.ts"
import { defineTask } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { planSchema } from "./ticket.ts";

export const plan = defineTask({
  key: "plan",
  after: [frame],
  perform: (context) => planSchema.parse(context.value(frame).output),
});
```

```ts title="approval.ts"
import { defineApprovalTask } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { ticket } from "./ticket.ts";

export const review = defineApprovalTask({
  key: "review",
  after: [plan],
  prompt: `Deliver this plan for ${ticket.key}?`,
  actors: ["owner"],
});
```

## Save progress and start

The checkpoint preserves questions, answers and the plan between processes. Save these files alongside the task declarations. Run `node plan-run.ts` to see the pending question or approval; run it again to inspect the same saved state.

<!-- tabs -->

```ts title="checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { ticket } from "./ticket.ts";

export const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: `${repository}/.outpost/storage`,
    }),
  }),
  runId: ticket.key,
  version: "1",
};
```

```ts title="plan-workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { plan } from "./plan.ts";
import { review } from "./approval.ts";

export const planning = defineWorkflow("plan-change", [frame, plan, review]);
```

```ts title="plan-run.ts"
import { planning } from "./plan-workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { plan } from "./plan.ts";

const result = await planning.start({ checkpoint });
console.log(result.status, result.inputRequests);
if (result.status === "paused") console.log(result.value(plan));
console.log(result.tasks.find((task) => task.key === "review")?.pause);
// Example output: waiting-input [ { id: '...', ... } ]
```

## Answer a question

Copy the `id` printed in `inputRequests` and pass your answer as the second argument: `node plan-answer.ts REQUEST_ID "Include dates in UTC"`. Each call resumes the captured conversation; it may produce another question.

```ts title="plan-answer.ts"
import { planning } from "./plan-workflow.ts";
import { checkpoint } from "./checkpoint.ts";

const [requestId, value] = process.argv.slice(2);
if (!requestId || !value) throw new Error("Pass the request ID and answer");
const current = await planning.start({ checkpoint });
const request = current.inputRequests.find((item) => item.id === requestId);
if (!request) throw new Error("Question is not pending");
const { executionId, key } = request;
const result = await planning.start({
  checkpoint,
  answers: [{ executionId, key, requestId, actor: "owner", value }],
});
console.log(result.status, result.inputRequests);
```

## Review and decide

When `node plan-run.ts` reports `paused`, read the saved plan it prints. Then run `node plan-decide.ts approve "Scope and tests reviewed"`, or use `reject` with your reason. This local example treats you as the trusted `owner`; a web application must authenticate the person before accepting that actor.

<!-- tabs -->

```ts title="pending-plan.ts"
import { planning } from "./plan-workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { plan } from "./plan.ts";

const [choice, explanation] = process.argv.slice(2);
if ((choice !== "approve" && choice !== "reject") || !explanation)
  throw new Error("Pass approve or reject, followed by a reason");
export const action = choice;
export const reason = explanation;
export const current = await planning.start({ checkpoint });
const pause = current.tasks.find((task) => task.key === "review")?.pause;
if (!pause) throw new Error("No approval pending");
export const pending = pause;
console.log(current.value(plan));
```

```ts title="plan-decide.ts"
import { planning } from "./plan-workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { current, pending, action, reason } from "./pending-plan.ts";

const result = await planning.start({
  checkpoint,
  decisions: [
    {
      executionId: current.executionId,
      key: "review",
      requestId: pending.id,
      actor: "owner",
      action,
      reason,
    },
  ],
});
console.log(result.status);
```

Approval ends this planning workflow with `done`; rejection ends it with `rejected`. Neither decision merges a branch. Instructions to inspect without editing do not enforce filesystem permissions. The agent’s questions use a retained workspace and a fresh sandbox per turn; [interactive tasks](../interactive-tasks/) covers failures and interrupted replay.

To implement the accepted plan, continue with [Build a development workflow](../development-workflow/). It reuses the task declarations in this page but has its own checkpoint identity. Start that combined workflow with a fresh run ID; do not reuse an already started planning checkpoint for a different graph.
