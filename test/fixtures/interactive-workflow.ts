import { join } from "node:path";
import {
  createAgent,
  createHarness,
  defineInteractiveAgentTask,
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineWorkflow,
} from "../../src/index.ts";
import type { WorkflowAnswer } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";

const repository = process.argv[2]!;
const answer: WorkflowAnswer | undefined = process.argv[3]
  ? JSON.parse(process.argv[3])
  : undefined;
const item = defineInteractiveAgentTask({
  key: "interview",
  repository,
  actors: ["owner"],
  brief: "Design a shop",
  bootstrap: false,
  sandboxProvider: createLocalSandboxProvider(),
  agent: createAgent({
    model: "fixture",
    harness: createHarness({
      modelProvider: {
        name: "scripted-interview",
        async request(request) {
          const history = JSON.stringify(request.messages);
          let turn: unknown = {
            kind: "question",
            question: "What are you selling?",
          };
          if (history.includes("clothes"))
            turn = { kind: "question", question: "Which sizes for clothes?" };
          if (history.includes("medium"))
            turn = {
              kind: "completed",
              output: { product: "clothes", size: "medium" },
            };
          const text = `<interaction>${JSON.stringify(turn)}</interaction>`;
          return {
            text,
            content: [{ type: "text", text }],
            stopReason: "end",
            usage: { input: 4, output: 2, cached: 0 },
          };
        },
      },
    }),
  }),
});
const result = await defineWorkflow("interview", [item]).start({
  checkpoint: {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({
        directory: join(repository, ".outpost", "storage"),
      }),
    }),
    runId: "interview",
    version: "1",
  },
  ...(answer ? { answers: [answer] } : {}),
});
console.log(
  JSON.stringify({
    status: result.status,
    executionId: result.executionId,
    inputRequests: result.inputRequests,
    usage: result.usage,
    ...(result.status === "done" ? { value: result.value(item) } : {}),
    errors: result.errors.map(String),
  }),
);
