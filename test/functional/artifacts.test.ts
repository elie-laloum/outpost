import assert from "node:assert/strict";
import { test } from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  defineJsonArtifact,
  defineArtifactTask,
  createArtifactStore,
  createWorkflowCheckpointStore,
  defineIsolatedTask,
  readArtifact,
  defineJsonResponse,
  defineWorkflow,
  createLocalTransport,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

function schema(value: unknown): { endpoint: string } {
  if (
    !value ||
    typeof value !== "object" ||
    !("endpoint" in value) ||
    typeof value.endpoint !== "string"
  )
    throw new Error("Invalid endpoint schema");
  return { endpoint: value.endpoint };
}

test("isolated repositories exchange validated artifacts and resume references in another process", async (t) => {
  const backendRepository = await repository(t),
    frontendRepository = await repository(t);
  const directory = join(backendRepository, ".outpost", "artifacts");
  const store = createArtifactStore({
    transporter: createLocalTransport({ directory: directory }),
  });
  const contract = defineJsonArtifact({ name: "api", version: "1", schema });
  const backend = defineIsolatedTask({
    key: "backend",
    request: () => ({
      repository: backendRepository,
      sandboxProvider: createLocalSandboxProvider(),
      agent: scripted(emit('<api>{"endpoint":"/users"}</api>')),
      brief: { text: "Describe API as <api>{...}</api>" },
      response: defineJsonResponse({ tag: "api", schema }),
    }),
  });
  const published = defineArtifactTask({
    key: "api",
    after: [backend],
    store,
    contract,
    produce: (context) => context.value(backend).value,
  });
  const frontend = defineIsolatedTask({
    key: "frontend",
    after: [published],
    request: async (context) => {
      const api = await readArtifact(
        context,
        published,
        contract,
        createArtifactStore({
          transporter: createLocalTransport({ directory: directory }),
        }),
      );
      return {
        repository: frontendRepository,
        sandboxProvider: createLocalSandboxProvider(),
        branch: { mode: "integrate" },
        brief: { text: api.endpoint },
        agent: scripted(
          (input) => `
      import { writeFileSync } from 'node:fs';
      import { execFileSync } from 'node:child_process';
      writeFileSync('endpoint.txt', ${JSON.stringify(input.text)});
      execFileSync('git', ['add','endpoint.txt']); execFileSync('git', ['commit','-m','Consume API']);
      ${emit("<outpost>done</outpost>")}
    `,
        ),
      };
    },
  });
  const result = await defineWorkflow("artifacts", [
    backend,
    published,
    frontend,
  ]).start();
  result.unwrap();
  assert.equal(
    await readFile(join(frontendRepository, "endpoint.txt"), "utf8"),
    "/users",
  );
  const reference = result.value(published);
  assert.equal(reference.producer.executionId, result.executionId);
  assert.equal(reference.producer.taskKey, "api");
  assert.ok(Object.isFrozen(reference.producer));
  const checkpointDirectory = join(
    backendRepository,
    ".outpost",
    "checkpoints",
  );
  const persisted = defineArtifactTask({
    key: "persisted",
    store,
    contract,
    produce: () => ({ endpoint: "/saved" }),
  });
  const checkpoint = {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({ directory: checkpointDirectory }),
    }),
    runId: "artifact",
    version: "1",
  };
  (
    await defineWorkflow("persisted", [persisted]).start({ checkpoint })
  ).unwrap();
  const script = join(frontendRepository, "read.mjs");
  await writeFile(
    script,
    `import { defineJsonArtifact, defineArtifactTask, createArtifactStore, createWorkflowCheckpointStore, readStoredArtifact, defineWorkflow, createLocalTransport } from ${JSON.stringify(new URL("../../src/index.ts", import.meta.url).href)};
    const store=createArtifactStore({ transporter: createLocalTransport({ directory: ${JSON.stringify(directory)} }) });
    const contract=defineJsonArtifact({name:'api',version:'1',schema:${schema.toString()}});
    const item=defineArtifactTask({key:'persisted',store,contract,produce(){throw new Error('must not replay')}});
    const result=await defineWorkflow('persisted',[item]).start({checkpoint:{store:createWorkflowCheckpointStore({ transporter: createLocalTransport({ directory: ${JSON.stringify(checkpointDirectory)} }) }),runId:'artifact',version:'1'}});
    result.unwrap(); console.log(JSON.stringify(await readStoredArtifact(store,contract,result.value(item))));
  `,
  );
  const child = await promisify(execFile)(process.execPath, [script]);
  assert.equal(JSON.parse(child.stdout).endpoint, "/saved");
});
