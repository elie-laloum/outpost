import {
  createSandbox,
  defineAgentTask,
  defineLoopTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
});

const fix = defineLoopTask({
  key: "fix-tests",
  maxRounds: 4,
  async attempt(context, feedback) {
    const coding = defineAgentTask({
      key: "coder",
      sandbox,
      request: () => ({
        brief: { text: `Fix the failing tests and commit.\n${feedback ?? ""}` },
      }),
    });
    const result = await coding.perform(context);
    return { summary: result.text, commits: result.commits.length };
  },
  async check(context) {
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal: context.signal,
    });
    return tests.status === 0
      ? { done: true }
      : { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
  },
});

const result = await defineWorkflow("fix-tests", [fix]).start();
result.unwrap();
console.log(result.value(fix).summary);
