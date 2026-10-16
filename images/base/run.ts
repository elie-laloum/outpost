import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import {
  dispatch,
  createAgent,
  createCodexHarness,
  OutpostError,
  createReporter,
} from "@elie-laloum/outpost";
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";

// Paths are relative to this workflow, regardless of where Node is launched.
const repository = resolve(import.meta.dirname, ".");
const environment = await readFile(
  new URL(".env", import.meta.url),
  "utf8",
).catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
const variables = Object.fromEntries(
  Object.entries({ ...parseEnv(""), ...parseEnv(environment) }).map(
    ([key, value]) => [key, value || process.env[key] || ""],
  ),
);
const runtime = {
  agent: createAgent({
    harness: createCodexHarness({ authentication: "account" }),
  }),
  sandboxProvider: createPodmanSandboxProvider({
    image: "outpost-base:dev",
    variables,
  }),
};
const objective =
  process.argv.slice(2).join(" ") ||
  "Inspect this repository and implement one useful improvement.";

console.error("[outpost] Preparing sandbox...");
try {
  const result = await dispatch({
    ...runtime,
    repository,
    branch: { mode: "integrate" },
    brief: {
      file: resolve(import.meta.dirname, "brief.md"),
      values: { OBJECTIVE: objective },
    },
    observe: createReporter(),
    warn: (message) => console.error(message),
  });
  console.log({
    branch: result.branch,
    commits: result.commits,
    conversation: result.conversation,
  });
} catch (error) {
  if (!(error instanceof OutpostError) || error.code !== "aborted") throw error;
  process.exitCode ||= 130;
  console.error("[outpost] Cancelled. Recovery details:", error.recovery);
}
