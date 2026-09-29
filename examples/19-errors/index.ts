// Errors — every Outpost failure carries a stable code, details,
// and sometimes a way to find the preserved work.

import { join } from "node:path";
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createOpenAIModelProvider,
  dispatch,
  OutpostError,
  quotaFault,
  recoveryDetails,
  unavailableFault,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";
import { quotaProxy } from "../39-quota-pauses/quota-proxy.ts";


const repository = demoRepository(import.meta.dirname);

// A deliberately hobbled agent: only one step allowed.
const hasty = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()], limits: { maxSteps: 1 } }),
});


async function explain(label: string, run: () => Promise<unknown>) {
  try {
    await run();
    console.log(`[${label}] aucune erreur`);
  } catch (error) {
    if (!(error instanceof OutpostError)) throw error; // not an Outpost error: let it propagate

    console.log(`[${label}] code : ${error.code}`);
    console.log("  message :", error.message);
    console.log("  détails :", error.details);
    console.log("  récupération :", recoveryDetails(error));
    if (error.code === "quota") console.log("  quota :", quotaFault(error)); // also finds a wrapped quota error
    if (unavailableFault(error)) console.log("  service indisponible :", unavailableFault(error));
  }
}


// 1. The brief expects a {{ city }} variable that isn't provided → code "prompt".
await explain("variable manquante", () =>
  dispatch({ repository, sandboxProvider, agent: hasty, brief: { file: join(import.meta.dirname, "weather.md") } }),
);


// 2. The agent needs several steps but only has one → code "limit".
await explain("limite atteinte", () =>
  dispatch({ repository, sandboxProvider, agent: hasty, brief: { file: join(import.meta.dirname, "read-all.md") } }),
);


// 3. The model service answers "429 Too Many Requests" → code "quota", with the reset time.
const proxy = await quotaProxy(process.env.OPENAPI_URL!);
proxy.limitFor(60);

const limited = createAgent({
  model,
  harness: createHarness({
    modelProvider: createOpenAIModelProvider({ baseUrl: proxy.url, apiKey: process.env.OPENAPI_KEY! }),
    tools: [createHarnessFileTools()],
  }),
});

await explain("quota atteint", () =>
  dispatch({ repository, sandboxProvider, agent: limited, brief: { file: join(import.meta.dirname, "read-all.md") } }),
);


// 4. The model service is down ("503 Service Unavailable") → code "provider",
//    marked as an outage: unavailableFault() reads it, a fallback agent can hand over on it.
proxy.limitFor(0);
proxy.downFor(60);

await explain("service en panne", () =>
  dispatch({ repository, sandboxProvider, agent: limited, brief: { file: join(import.meta.dirname, "read-all.md") } }),
);
await proxy.close();
