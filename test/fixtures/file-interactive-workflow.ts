import { writeSync } from "node:fs";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  defineHarnessTool,
  defineInteractiveAgentTask,
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineWorkflow,
} from "../../src/index.ts";
import type { WorkflowAnswer, SandboxProvider } from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";

const control = process.argv[2]!;
const answer: WorkflowAnswer | undefined = process.argv[3]
  ? JSON.parse(process.argv[3])
  : undefined;
let active = 0;
let directory: string | undefined;
const local = createLocalSandboxProvider();
const provider: SandboxProvider = {
  ...local,
  workspaces: {
    bindings: local.workspaces!.bindings,
    async acquire(context) {
      const lease = await local.workspaces!.acquire(context);
      directory = context.workspace.directory;
      active++;
      let closed = false;
      return {
        ...lease,
        async release() {
          if (closed) return;
          closed = true;
          active--;
          await lease.release();
        },
      };
    },
  },
};
const file = defineHarnessTool({
  name: "write",
  description: "Create the interview file",
  input: { type: "object", additionalProperties: false },
  async execute(_input, context) {
    await context.sandbox.invoke({
      executable: process.execPath,
      arguments: ["-e", "require('fs').appendFileSync('interview.txt','one')"],
    });
    return "file-created";
  },
});
const item = defineInteractiveAgentTask({
  retention: { policy: "local" },
  key: "interview",
  workspaceSource: { kind: "ephemeral" },
  runtime: { directory: control },
  sandboxProvider: provider,
  actors: ["owner"],
  brief: "Write a file, then ask for confirmation",
  agent: createAgent({
    model: "fixture",
    harness: createHarness({
      tools: [file],
      modelProvider: {
        name: "file-interview",
        async request(request) {
          const history = JSON.stringify(request.messages);
          if (!history.includes("file-created"))
            return {
              text: "",
              content: [
                { type: "tool-call", id: "write-1", name: "write", input: {} },
              ],
              stopReason: "tool-calls",
              usage: { input: 1, cached: 0, output: 1 },
            };
          const value = history.includes("accepted")
            ? { kind: "completed", output: "accepted" }
            : { kind: "question", question: "Accept the file?" };
          const text = `<interaction>${JSON.stringify(value)}</interaction>`;
          return {
            text,
            content: [{ type: "text", text }],
            stopReason: "end",
            usage: { input: 1, cached: 0, output: 1 },
          };
        },
      },
    }),
  }),
});
const result = await defineWorkflow("file-interview", [item]).start({
  checkpoint: {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({
        directory: join(control, "storage"),
      }),
    }),
    runId: "interview",
    version: "file-1",
    workspaces: true,
  },
  ...(answer ? { answers: [answer] } : {}),
});
writeSync(
  1,
  JSON.stringify({
    status: result.status,
    executionId: result.executionId,
    inputRequests: result.inputRequests,
    directory,
    active,
    errors: result.errors.map(String),
    ...(result.status === "done" ? { value: result.value(item) } : {}),
  }),
);
