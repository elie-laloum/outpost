import { resolve } from "node:path";
import {
  createAgent,
  createCodexHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const agent = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
});

const result = await dispatch({
  repository: resolve(import.meta.dirname, "../repository"),
  agent,
  sandboxProvider,
  branch: { mode: "integrate" },
  brief: {
    file: resolve(import.meta.dirname, "brief.md"),
    values: { OBJECTIVE: process.argv.slice(2).join(" ") },
  },
});
console.log(result.branch, result.commits);
