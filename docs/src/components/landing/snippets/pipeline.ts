import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, sandboxProvider } from "./outpost.config.mts";

const agent = defineIsolatedTask({
  key: "agent",
  request: () => ({
    repository: "../parser",
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-parser" },
    brief: { text: "Fix the parser tests, run them, commit." },
  }),
});
const fix = defineTask({
  key: "fix",
  perform: async (context) => {
    const { branch, commits } = await agent.perform(context);
    return { branch, commits: commits.length };
  },
});
const summary = defineTask({
  key: "summary",
  after: [fix],
  perform: (context) =>
    `${context.value(fix).commits} commit(s) on ${context.value(fix).branch}`,
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
