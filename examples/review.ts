import {
  agentTask,
  codex,
  claude,
  createSandbox,
  workflow,
} from "../src/index.ts";
import { docker } from "../src/providers/docker.ts";

await using sandbox = await createSandbox({
  provider: docker(),
  branch: { mode: "named", name: "outpost/review-example" },
});

const implement = agentTask({
  key: "implement",
  sandbox,
  request: () => ({
    agent: codex(),
    brief: {
      text:
        process.argv.slice(2).join(" ") ||
        "Improve one concrete validation path. Add tests and commit.",
    },
  }),
});

const review = agentTask({
  key: "review",
  after: [implement],
  sandbox,
  request: (context) => ({
    agent: claude(),
    brief: {
      text: `Review these changes, fix defects, test and commit:\n${context.value(implement).text}`,
    },
  }),
});

const result = await workflow("implement-and-review", [
  implement,
  review,
]).start();
result.unwrap();
console.log(result.value(review).commits);
