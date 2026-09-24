import assert from "node:assert/strict";
import { test } from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  artifact,
  artifactTask,
  fileArtifactStore,
  fileWorkflowCheckpointStore,
  isolatedTask,
  readArtifact,
  response,
  workflow,
} from "../../src/index.ts";
import { local } from "../../src/providers/local.ts";
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
  const store = fileArtifactStore({ directory });
  const contract = artifact.json({ name: "api", version: "1", schema });
  const backend = isolatedTask({
    key: "backend",
    request: () => ({
      repository: backendRepository,
      provider: local(),
      agent: scripted(emit('<api>{"endpoint":"/users"}</api>')),
      brief: { text: "Describe API as <api>{...}</api>" },
      response: response.json({ tag: "api", schema }),
    }),
  });
  const published = artifactTask({
    key: "api",
    after: [backend],
    store,
    contract,
    produce: (context) => context.value(backend).value,
  });
  const frontend = isolatedTask({
    key: "frontend",
    after: [published],
    request: async (context) => {
      const api = await readArtifact(
        context,
        published,
        contract,
        fileArtifactStore({ directory }),
      );
      return {
        repository: frontendRepository,
        provider: local(),
        branch: { mode: "integrate" },
        brief: { text: api.endpoint },
        agent: scripted(
          (input) => `
      import {writeFileSync} from 'node:fs';
      import {execFileSync} from 'node:child_process';
      writeFileSync('endpoint.txt', ${JSON.stringify(input.text)});
      execFileSync('git', ['add','endpoint.txt']); execFileSync('git', ['commit','-m','Consume API']);
      ${emit("<outpost>done</outpost>")}
    `,
        ),
      };
    },
  });
  const result = await workflow("artifacts", [
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
  const persisted = artifactTask({
    key: "persisted",
    store,
    contract,
    produce: () => ({ endpoint: "/saved" }),
  });
  const checkpoint = {
    store: fileWorkflowCheckpointStore({ directory: checkpointDirectory }),
    runId: "artifact",
    version: "1",
  };
  (await workflow("persisted", [persisted]).start({ checkpoint })).unwrap();
  const script = join(frontendRepository, "read.mjs");
  await writeFile(
    script,
    `import {artifact,artifactTask,fileArtifactStore,fileWorkflowCheckpointStore,readStoredArtifact,workflow} from ${JSON.stringify(new URL("../../src/index.ts", import.meta.url).href)};
    const store=fileArtifactStore({directory:${JSON.stringify(directory)}});
    const contract=artifact.json({name:'api',version:'1',schema:${schema.toString()}});
    const item=artifactTask({key:'persisted',store,contract,produce(){throw new Error('must not replay')}});
    const result=await workflow('persisted',[item]).start({checkpoint:{store:fileWorkflowCheckpointStore({directory:${JSON.stringify(checkpointDirectory)}}),runId:'artifact',version:'1'}});
    result.unwrap(); console.log(JSON.stringify(await readStoredArtifact(store,contract,result.value(item))));
  `,
  );
  const child = await promisify(execFile)(process.execPath, [script]);
  assert.equal(JSON.parse(child.stdout).endpoint, "/saved");
});
