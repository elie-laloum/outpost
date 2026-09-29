// Recoverable speculation — the race is persisted through a Transport.
// The coordinator is killed (kill -9) in the middle of the race; another process
// inspects what it left, takes the race back explicitly, and finishes it.

import { execFileSync, spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import {
  checkSpeculationIntegration,
  createAgent,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  createLocalTransport,
  createObservationHub,
  recoverSpeculation,
  speculate,
  type ObservationHub,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";


const repository = demoRepository(import.meta.dirname);
const state = join(import.meta.dirname, "state");
const transporter = createLocalTransport({ directory: state });
const runId = "slug-race";

const coder = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [createHarnessFileTools(), createHarnessEditTools(), createHarnessShellTools()],
  }),
});


// The same race, for the first coordinator and for the one that resumes it.
function race(options: { resume?: "retry-incomplete"; observation?: ObservationHub } = {}) {
  return speculate({
    repository,
    sandboxProvider, // mounted Docker: it knows how to find and clean up orphan sandboxes
    concurrency: 2,
    budget: { attempts: 4 }, // cumulative: the attempts of the crashed run count too
    observation: options.observation,

    // Where the race lives. Change `version` if agents, briefs or validation change.
    durability: { transporter, runId, version: "1", resume: options.resume },

    candidates: ["minimal", "regex"].map((key) => ({
      key,
      agent: coder,
      request: { brief: { file: join(import.meta.dirname, `${key}.md`) } },
    })),

    async validate({ sandbox, signal }) {
      const tests = await sandbox.command({ executable: "npm", arguments: ["test"], signal });
      return tests.status === 0;
    },
  });
}


// ── Child process: the coordinator that crashes as soon as a candidate uses a tool.
if (process.argv.includes("--coordinator")) {
  const observation = createObservationHub({
    sinks: [{
      observe({ scope, event }) {
        if (event.kind !== "tool") return;
        console.log(`  ${scope.candidate} appelle ${event.name}… kill -9 du coordinateur`);
        process.kill(process.pid, "SIGKILL");
      },
    }],
  });

  await race({ observation });
  process.exit();
}


// ── Main process.
await rm(state, { recursive: true, force: true });

console.log("1. le coordinateur démarre la course");
const crashed = spawnSync(process.execPath, [...process.execArgv, import.meta.filename, "--coordinator"], { stdio: "inherit" });
console.log("  coordinateur terminé par", crashed.signal);


console.log("\n2. ce qu'il reste dans le Transport");
const [entry] = await Array.fromAsync(transporter.list("speculations/"));
const envelope = JSON.parse(new TextDecoder().decode((await transporter.read(entry!.key))!.bytes));
console.log("  propriétaire :", envelope.owner, "— révision :", entry!.revision);


console.log("\n3. relancer sans récupération explicite est refusé");
await race({ resume: "retry-incomplete" }).then(
  () => console.log("  accepté ?!"),
  (error) => console.log("  refusé :", (error as Error).message),
);


console.log("\n4. récupération : on atteste que l'ancien coordinateur est arrêté");
await recoverSpeculation({ transporter, runId, revision: entry!.revision, coordinatorStopped: true });


console.log("\n5. reprise de la course");
const result = await race({ resume: "retry-incomplete" });

console.log("  statut :", result.status, "— gagnant :", result.winner?.key, "sur", result.winner?.branch);
console.log("  tentatives cumulées :", result.usage.attempts);
for (const attempt of result.previousAttempts ?? []) console.log(`  tentative interrompue : ${attempt.key} (${attempt.status}) sur ${attempt.branch}`);
for (const candidate of result.candidates) console.log(`  ${candidate.key} → ${candidate.status}`);


// 6. Merge check: computed without touching the checkout, then re-checked right before merging.
const winner = result.winner;
if (winner) {
  const integration = await checkSpeculationIntegration(repository, winner.branch, winner.commit);
  console.log("\n6. intégration :", integration.status, integration.conflicts.join(", "));

  if (integration.status === "clean") {
    execFileSync("git", ["merge", "--no-edit", winner.branch], { cwd: repository });
    console.log("  fusionné dans", integration.host.branch);
  }
}
