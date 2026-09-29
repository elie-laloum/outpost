import {
  authenticationEnvironment,
  authenticationSource,
} from "./init-authentication.ts";
import { builtInAgent } from "../adapters/agents/catalog.ts";
import { invariant } from "../domain/errors.ts";
import type { InitOptions } from "./scaffold.types.ts";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function starter(options: InitOptions): string {
  const agent = options.agent ?? "codex",
    sandboxProvider = options.sandboxProvider ?? "docker";
  const descriptor = builtInAgent(agent);
  invariant(descriptor, `Unknown agent: ${agent}`);
  const harness = descriptor.harnessExport,
    provider = `create${capitalize(sandboxProvider)}SandboxProvider`;
  const model = options.model ? `model: ${JSON.stringify(options.model)}` : "";
  const modelProvider = options.baseUrl
    ? `modelProvider: ${JSON.stringify({ baseUrl: options.baseUrl, ...(options.apiKeyEnvironment ? { apiKeyEnvironment: options.apiKeyEnvironment } : {}) })}`
    : "";
  const image =
    options.image &&
    (sandboxProvider === "docker" || sandboxProvider === "podman")
      ? `image: ${JSON.stringify(options.image)}, `
      : "";
  return `import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import { dispatch, createAgent, ${harness}, OutpostError, createReporter } from "@elie-laloum/outpost";
import { ${provider} } from "@elie-laloum/outpost/providers/${sandboxProvider}";

// Paths are relative to this workflow, regardless of where Node is launched.
const repository = resolve(import.meta.dirname, ${JSON.stringify(options.repository ?? ".")});
const environment = await readFile(new URL(".env", import.meta.url), "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
const variables = Object.fromEntries(
  Object.entries({ ...parseEnv(${JSON.stringify(authenticationEnvironment(options))}), ...parseEnv(environment) }).map(([key, value]) => [key, value || process.env[key] || ""]),
);
const runtime = {
  agent: createAgent({ harness: ${harness}({ authentication: ${authenticationSource(options)}${modelProvider ? ", " + modelProvider : ""} }), ${model} }),
  sandboxProvider: ${provider}({ ${image}variables }),
};
const objective = process.argv.slice(2).join(" ") || "Inspect this repository and implement one useful improvement.";

console.error("[outpost] Preparing sandbox...");
try {
  const result = await dispatch({
    ...runtime,
    repository,
    branch: { mode: "integrate" },
    brief: { file: resolve(import.meta.dirname, "brief.md"), values: { OBJECTIVE: objective } },
    observe: createReporter(),
    warn: (message) => console.error(message),
  });
  console.log({ branch: result.branch, commits: result.commits, conversation: result.conversation });
} catch (error) {
  if (!(error instanceof OutpostError) || error.code !== "aborted") throw error;
  process.exitCode ||= 130;
  console.error("[outpost] Cancelled. Recovery details:", error.recovery);
}
`;
}
