import {
  authenticationEnvironment,
  authenticationSource,
} from "./init-authentication.ts";
import type { InitOptions } from "./scaffold.types.ts";

export function starter(options: InitOptions): string {
  const agent = options.agent ?? "codex",
    sandboxProvider = options.sandboxProvider ?? "docker";
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
import { homedir } from "node:os";
import { parseEnv } from "node:util";
import { dispatch, agent, ${agent}Harness, OutpostError, reporter } from "@elie-laloum/outpost";
import { ${sandboxProvider}SandboxProvider } from "@elie-laloum/outpost/providers/${sandboxProvider}";

// Paths are relative to this workflow, regardless of where Node is launched.
const repository = resolve(import.meta.dirname, ${JSON.stringify(options.repository ?? ".")});
const environment = await readFile(new URL(".env", import.meta.url), "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
const variables = Object.fromEntries(
  Object.entries({ ...parseEnv(${JSON.stringify(authenticationEnvironment(options))}), ...parseEnv(environment) }).map(([key, value]) => [key, value || process.env[key] || ""]),
);
${authenticationSource(options)}
const runtime = {
  agent: agent({ harness: ${agent}Harness({ authentication${modelProvider ? ", " + modelProvider : ""} }), ${model} }),
  sandboxProvider: ${sandboxProvider}SandboxProvider({ ${image}variables }),
};
const objective = process.argv.slice(2).join(" ") || "Inspect this repository and implement one useful improvement.";

console.error("[outpost] Preparing sandbox...");
try {
  const result = await dispatch({
    ...runtime,
    repository,
    branch: { mode: "integrate" },
    brief: { file: resolve(import.meta.dirname, "brief.md"), values: { OBJECTIVE: objective } },
    observe: reporter(),
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
