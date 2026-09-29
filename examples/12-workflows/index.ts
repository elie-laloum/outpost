// Workflows — a graph of typed tasks linked by their dependencies.
// Mix freely: agent tasks, commands, plain TypeScript code.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  createReporter,
  createSandbox,
  defineAgentTask,
  defineCommandTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


await using sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider,
  branch: { mode: "named", name: "demo/workflow" },
});

const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [createHarnessFileTools(), createHarnessEditTools(), createHarnessShellTools()],
  }),
});


// 1. The agent fixes the bug.
const fix = defineAgentTask({
  key: "fix",
  sandbox,
  request: () => ({ 
    agent: coder,
    brief: { file: join(import.meta.dirname, "brief.md") },
    observe: createReporter({ label: "fix" })
  }),
});

// 2. A real command verifies (the task fails if the status isn't 0).
const tests = defineCommandTask({
  key: "tests",
  after: [fix],
  sandbox,
  command: { executable: "npm", arguments: ["test"], observe: (channel, text) => (channel === "stderr" ? process.stderr : process.stdout).write(text),
 },
});

// 3. Plain code reads the typed results of the previous tasks.
const report = defineTask({
  key: "report",
  after: [fix, tests],
  perform: (context) => ({
    commits: context.value(fix).commits.map((commit) => commit.subject),
    tests: context.value(tests).status === 0 ? "pass" : "fail",
  }),
});


const plan = defineWorkflow("fix-and-verify", [fix, tests, report]);

console.log(plan.diagram()); // the graph in Mermaid format

const result = await plan.start({
  observe(event) {
    console.log(event.type + ' - ' + event.key + ' - ' + event.status)
  }
});
result.unwrap(); // throws if a task failed

console.log(result.value(report));
console.log("usage :", result.usage);
