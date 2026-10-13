// Two agents read the same Wikipedia article through different sandbox policies.
// The model runs on the host; each agent's Wikipedia tool runs in its own container.

import { join } from "node:path";
import { createWorkspace, defineTextResponse } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { createPodmanSandboxProvider } from "@elie-laloum/outpost/providers/podman";
import { model, modelProvider } from "../shared/model.ts";
import { createWikipediaAgent } from "./agent.ts";

const factories = {
  docker: createDockerSandboxProvider,
  podman: createPodmanSandboxProvider,
};
const engine = process.argv[2] ?? "docker";
if (engine !== "docker" && engine !== "podman")
  throw new Error(
    "Usage: node examples/73-container-egress/index.ts [docker|podman]",
  );

for (const allowed of [true, false]) {
  const label = allowed ? "Wikipédia autorisé" : "Wikipédia bloqué";
  console.log(`\n=== ${label} ===`);

  await using workspace = await createWorkspace({
    source: { kind: "ephemeral" },
    runtime: {
      directory: join(import.meta.dirname, "../../.outpost"),
      namespace: "egress-example",
    },
  });
  await using sandbox = await workspace.sandbox({
    sandboxProvider: factories[engine]({
      image:
        process.env.OUTPOST_CONTAINER_IMAGE ?? "docker.io/library/node:24-slim",
      ...(allowed && process.env.OUTPOST_EGRESS_IMAGE
        ? { egressImage: process.env.OUTPOST_EGRESS_IMAGE }
        : {}),
      egress: allowed
        ? { mode: "allowlist", domains: ["fr.wikipedia.org"] }
        : { mode: "deny-all" },
    }),
  });

  const result = await sandbox.dispatch({
    agent: createWikipediaAgent(modelProvider, model),
    brief: { file: join(import.meta.dirname, "brief.md") },
    response: defineTextResponse({ tag: "resume", repairs: 1 }),
    observe(event) {
      if (event.kind === "tool-result")
        console.log(
          `[${event.name}] ${event.isError ? "échec" : "page consultée"}`,
        );
    },
  });
  console.log(result.value);
}
