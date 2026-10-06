// Typed artifacts — one task publishes a validated value, another reads it back.
// The bytes live in a store; only a reference travels through the workflow.

import { join } from "node:path";
import * as v from "valibot";
import {
  createAgent,
  createArtifactStore,
  createHarness,
  createHarnessFileTools,
  createLocalTransport,
  defineArtifactTask,
  defineJsonArtifact,
  defineJsonResponse,
  defineTask,
  defineWorkflow,
  dispatch,
  readArtifact,
} from "@elie-laloum/outpost";
import { model, modelProvider, sandboxProvider } from "../shared/model.ts";
import { demoRepository } from "../shared/repository.ts";

// The artifact contract: a name, a version, a schema.
const Endpoints = v.array(v.object({ method: v.string(), path: v.string() }));

const apiContract = defineJsonArtifact({
  name: "api-endpoints",
  version: "1",
  schema: Endpoints,
});

const transporter = createLocalTransport({
  directory: join(import.meta.dirname, "state"),
});
const store = createArtifactStore({ transporter, maxBytes: 1_000_000 });

const reader = createAgent({
  model,
  harness: createHarness({ modelProvider, tools: [createHarnessFileTools()] }),
});

// 1. Producer: the agent extracts the API routes, published as an artifact.
const extract = defineArtifactTask({
  key: "extract",
  store,
  contract: apiContract,
  produce: async () => {
    const result = await dispatch({
      repository: demoRepository(import.meta.dirname),
      sandboxProvider,
      agent: reader,
      brief: { file: join(import.meta.dirname, "brief.md") },
      response: defineJsonResponse({
        jsonSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              method: { type: "string" },
              path: { type: "string" },
            },
            required: ["method", "path"],
          },
        },
        tag: "endpoints",
        schema: Endpoints,
      }),
    });

    return result.value;
  },
});

// 2. Consumer: reads the artifact back (contract and integrity checked) and turns it into docs.
const docs = defineTask({
  key: "docs",
  after: [extract],
  perform: async (context) => {
    const endpoints = await readArtifact(context, extract, apiContract, store);

    return endpoints
      .map((endpoint) => `- ${endpoint.method} ${endpoint.path}`)
      .join("\n");
  },
});

const result = await defineWorkflow("api-docs", [extract, docs]).start();
result.unwrap();

console.log("référence :", result.value(extract)); // id, digest, size, producer…
console.log(result.value(docs));
