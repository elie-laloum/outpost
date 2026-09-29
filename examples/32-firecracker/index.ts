// Firecracker — the sandbox is a microVM with its own Linux kernel,
// reached over SSH. Optionally launched through the jailer: private jail,
// unprivileged VMM and cgroup v2 limits (CPU, memory, processes).
//
// The host is prepared by you, not by Outpost: KVM access, TAP device, kernel,
// rootfs with SSH + Git + Node, dedicated SSH key and trusted host key.
// Put the path of the JSON options (FirecrackerOptions) in the .env:
//   OUTPOST_FIRECRACKER_CONFIG=/path/to/config.json
// With a "jailer" section, run the demo as root (Outpost never calls sudo).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  createReporter,
  createSandbox,
} from "@elie-laloum/outpost";
import {
  createFirecrackerSandboxProvider,
  type FirecrackerOptions,
} from "@elie-laloum/outpost/providers/firecracker";
import { model, modelProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const options: FirecrackerOptions = JSON.parse(readFileSync(process.env.OUTPOST_FIRECRACKER_CONFIG!, "utf8"));

console.log("microVM :", options.cpus ?? 1, "vCPU,", options.memoryMb ?? 512, "Mio");
console.log("jailer :", options.jailer
  ? `${options.jailer.cpuQuotaUs / 1_000} % d'un CPU hôte, ${options.jailer.memoryMaxMb} Mio max, ${options.jailer.processes} processus, uid ${options.jailer.uid}`
  : "non (lancement direct)");


// 1. Boot: the provider starts the VM, waits for SSH, then copies the workspace.
await using sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider: createFirecrackerSandboxProvider(options),
  branch: { mode: "named", name: "demo/firecracker" },
});


// 2. Proof that we are in another kernel, not in a container of the host.
const run = async (executable: string, ...args: string[]) =>
  (await sandbox.command({ executable, arguments: args })).stdout.trim();

console.log("\nnoyau hôte   :", readFileSync("/proc/sys/kernel/osrelease", "utf8").trim());
console.log("noyau invité :", await run("uname", "-r"));
console.log("vCPU invité  :", await run("nproc"));
console.log("mémoire      :", await run("sh", "-c", "free -m | awk '/Mem/ {print $2 \" Mio\"}'"));


// 3. An agent works in the VM. The custom harness calls the model from the host,
//    so the guest itself needs no network access at all.
const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [createHarnessFileTools(), createHarnessEditTools(), createHarnessShellTools()],
  }),
});

const result = await sandbox.dispatch({
  agent: coder,
  brief: { file: join(import.meta.dirname, "brief.md") },
  observe: createReporter({ label: "firecracker" }),
});

console.log("\ncommits rapportés sur l'hôte :", result.commits.map((commit) => commit.subject));

// 4. Leaving the block releases the VM: with the jailer, its cgroup and private jail
//    are removed too. If cleanup is uncertain, the resources are kept and it fails loudly.
