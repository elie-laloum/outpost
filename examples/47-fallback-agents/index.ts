// Fallback agents — an ordered list of agents: when one hits a limit (HTTP 429) or its
// service is down (HTTP 503), the next one takes over, in the same sandbox, from the original brief.
// A recorded fallback run can then be replayed: the handover comes back without calling the model.

import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  createAgent,
  createFallbackAgent,
  createHarness,
  createHarnessFileTools,
  createLocalTransport,
  createOpenAIModelProvider,
  createReplayAgent,
  dispatch,
  OutpostError,
  readJournal,
  recoveryDetails,
  type AgentEvent,
  type FallbackRecord,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";
import { quotaProxy } from "../39-quota-pauses/quota-proxy.ts";

const repository = demoRepository(import.meta.dirname);
const brief = { file: join(import.meta.dirname, "summary.md") };

const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });
await mkdir(state, { recursive: true });
const transporter = createLocalTransport({ directory: state });

// The first candidate goes through the proxy from demo 39, which plays a limited or broken service.
// The backup talks to the service directly. In real life: another model, or another harness.
const proxy = await quotaProxy(process.env.OPENAPI_URL!);
const limited = createOpenAIModelProvider({
  baseUrl: proxy.url,
  apiKey: process.env.OPENAPI_KEY!,
});

const tools = [createHarnessFileTools()];
const primary = createAgent({
  model,
  harness: createHarness({ modelProvider: limited, tools }),
});
const backup = createAgent({
  model,
  harness: createHarness({ modelProvider, tools }),
});

const reader = createFallbackAgent([primary, backup], {
  on: ["quota", "unavailable"],
});

const observe = (event: AgentEvent) => {
  if (event.kind === "fallback")
    console.log(
      `  ↪ relais ${event.from.index} → ${event.to.index} (${event.failure}) : ${event.message}`,
    );
};

const describe = (fallback: FallbackRecord | undefined) =>
  fallback
    ? `candidat ${fallback.selected.index} retenu après ${fallback.attempts.map((attempt) => `${attempt.index} (${attempt.failure})`).join(", ")}`
    : "aucun relais";

try {
  // 1. The first candidate hits a quota: the backup answers. The run is recorded for step 4.
  console.log("1. quota sur le premier candidat");
  proxy.limitFor(60);

  const quota = await dispatch({
    repository,
    sandboxProvider,
    agent: reader,
    brief,
    observe,
    logging: { transporter, replayable: true },
  });

  console.log("  réponse :", quota.text.trim());
  console.log("  " + describe(quota.fallback));
  console.log("  usage (tous les candidats) :", quota.usage);

  // 2. The first candidate's service is down: same handover, for another reason.
  console.log("\n2. service du premier candidat en panne");
  proxy.limitFor(0);
  proxy.downFor(60);

  const outage = await dispatch({
    repository,
    sandboxProvider,
    agent: reader,
    brief,
    observe,
  });
  console.log("  " + describe(outage.fallback));

  // 3. Every candidate is limited: the last error comes back with code "quota" and the earliest reset,
  //    and the stopped candidates are listed in the recovery details.
  console.log("\n3. tous les candidats limités");
  proxy.downFor(0);
  proxy.limitFor(60);

  const second = createAgent({
    model,
    harness: createHarness({ modelProvider: limited, tools }),
  });
  try {
    await dispatch({
      repository,
      sandboxProvider,
      agent: createFallbackAgent([primary, second], { on: ["quota"] }),
      brief,
      observe,
    });
  } catch (error) {
    if (!(error instanceof OutpostError)) throw error;
    console.log(`  code : ${error.code} · levée à ${error.details.resetAt}`);
    console.log("  candidats arrêtés :", recoveryDetails(error)?.fallback);
  }

  // 4. The replay of step 1: the stopped turn, then the handover, then the backup's turn.
  console.log("\n4. rejeu de l'étape 1, sans modèle");
  const journal = await readJournal({
    transporter,
    reference: quota.logReference!,
  });
  const replaying = createReplayAgent({ journal });

  for (const turn of replaying.turns) {
    console.log(
      turn.handover
        ? `  tour interrompu, relais (${turn.handover.failure})`
        : `  tour complet : ${turn.text.trim()}`,
    );
  }

  const replayed = await dispatch({
    repository,
    sandboxProvider,
    agent: replaying,
    brief,
    observe,
  });
  console.log(
    "  même réponse :",
    replayed.text === quota.text,
    "· result.fallback :",
    replayed.fallback,
  );
} finally {
  await proxy.close();
}
