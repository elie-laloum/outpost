import {
  createAgent,
  createClaudeHarness,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

const agent = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
const sandboxProvider = createPodmanSandboxProvider({
  image: "outpost:dev",
});

const review = (key: string, repository: string) =>
  defineIsolatedTask({
    key,
    request: ({ signal }) => ({
      repository,
      sandboxProvider,
      agent,
      signal,
      branch: { mode: "named", name: `review/${key}` },
      brief: {
        text: "Review the public API without editing files.",
      },
    }),
  });
const api = review("api", "../api");
const web = review("web", "../web");

const result = await defineWorkflow("review", [api, web]).start(
  {
    concurrency: 2,
  },
);
console.log(result.value(api).text, result.value(web).text);
