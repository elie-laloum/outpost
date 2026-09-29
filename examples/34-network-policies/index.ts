// Network policies — cut the sandbox off from the Internet with `egress`.
// The custom harness calls the model from the host: the agent keeps thinking,
// but nothing it runs inside the sandbox can reach the outside world.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessShellTools,
  createReporter,
  createSandbox,
  dispatch,
  type SandboxProvider,
} from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { model, modelProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);

const open = createDockerSandboxProvider({ image: "outpost:sandbox" });
const offline = createDockerSandboxProvider({ image: "outpost:sandbox", egress: { mode: "deny-all" } });


// Tries to reach the npm registry from inside a sandbox.
async function probe(label: string, sandboxProvider: SandboxProvider) {
  await using sandbox = await createSandbox({ repository, sandboxProvider });

  const curl = await sandbox.command({
    executable: "curl",
    arguments: ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "5", "https://registry.npmjs.org/"],
  });

  console.log(label.padEnd(10), curl.status === 0 ? `joignable (HTTP ${curl.stdout})` : `bloqué — ${curl.stderr.trim()}`);
}


// 1. Same image, two policies.
await probe("ouvert :", open);
await probe("deny-all :", offline);


// 2. An agent in the offline sandbox: the model answers (it is called from the host),
//    but `npm install` inside the sandbox cannot download anything.
const coder = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessShellTools()] }),
});

await dispatch({
  repository,
  sandboxProvider: offline,
  agent: coder,
  brief: { file: join(import.meta.dirname, "brief.md") },
  observe: createReporter({ label: "offline" }),
});


// 3. A policy the provider cannot enforce is refused before any sandbox starts:
//    Docker isolates the network namespace, but cannot filter by domain.
//    (Vercel and Daytona accept domain allowlists; local and Firecracker accept no policy.)
try {
  const filtered = createDockerSandboxProvider({
    image: "outpost:sandbox",
    egress: { mode: "allowlist", domains: ["registry.npmjs.org"] },
  });

  await using sandbox = await createSandbox({ repository, sandboxProvider: filtered });
  console.log("\nallowlist sur Docker → accepté ?!");
} catch (error) {
  console.log("\nallowlist sur Docker → refusé :", (error as Error).message);
}
