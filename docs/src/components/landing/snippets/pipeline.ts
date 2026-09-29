import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const fix = defineIsolatedTask({
  key: "fix",
  request: ({ signal }) => ({
    repository: "../parser",
    sandboxProvider,
    agent: coder,
    signal,
    branch: { mode: "named", name: "outpost/fix-parser" },
    brief: { text: "Fix the parser tests, run them, commit." },
  }),
});
const summary = defineTask({
  key: "summary",
  after: [fix],
  perform: (context) => ({
    branch: context.value(fix).branch,
    commits: context.value(fix).commits.length,
  }),
});
const approve = defineApprovalTask({
  key: "approve",
  after: [summary],
  prompt: "Merge outpost/fix-parser?",
  actors: ["maintainer"],
});

const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({
    directory: ".outpost/storage",
  }),
});
const result = await defineWorkflow("fix-parser", [
  fix,
  summary,
  approve,
]).start({
  checkpoint: { store, runId: "fix-1", version: "1" },
});
console.log(result.status); // "paused" for the maintainer
