// Providers — choose WHERE commands run, independently of the agent.
// Same agent, same brief: only the environment changes.

import { join } from "node:path";
import { createAgent, createHarness, createHarnessShellTools, dispatch } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { model, modelProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const providers = {
  docker: createDockerSandboxProvider({ image: "outpost:sandbox" }), // isolated container
  local: createLocalSandboxProvider(),                                // directly on the host, no isolation
};


const inspector = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessShellTools()] }),
});

const repository = demoRepository(import.meta.dirname);


for (const [name, sandboxProvider] of Object.entries(providers)) {
  const result = await dispatch({
    repository,
    sandboxProvider,
    agent: inspector,
    brief: { file: join(import.meta.dirname, "brief.md") },
  });

  console.log(`[${name}]`, result.text);
}
