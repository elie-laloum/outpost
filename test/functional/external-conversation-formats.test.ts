import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { basename, join, posix } from "node:path";
import { test } from "node:test";
import {
  createAgent,
  createLocalTransport,
  createSessionBundleConversations,
  createTranscriptConversations,
  createTransportConversations,
  dispatch,
  type AgentAdapter,
  type AgentEvent,
  type AgentInput,
  type ConversationStore,
  type SessionBundleProfile,
  type TranscriptConversationLayout,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const transcriptLayout: TranscriptConversationLayout = {
  format: "mycli",
  sidecars: false,
  searchRoot: (home) => join(home, ".mycli", "sessions"),
  remoteSearchRoot: (home) => posix.join(home, ".mycli", "sessions"),
  pattern: (id) => `${id}.jsonl`,
  matches: (file, id) => basename(file) === `${id}.jsonl`,
  directory: (_repository, home) => join(home, ".mycli", "sessions"),
  capturePath: (id, _repository, home) =>
    join(home, ".mycli", "sessions", `${id}.jsonl`),
  remotePath: (id, lease) =>
    posix.join(lease.home, ".mycli", "sessions", `${id}.jsonl`),
};

const bundleProfile: SessionBundleProfile = {
  format: "mybundle",
  root: { directory: ".mybundle" },
  sessions: "sessions",
  include: /^(?:state\.json|notes\.txt)$/,
  required: ["state.json"],
  relocated: ["state.json"],
  validate: (files, id) =>
    JSON.parse(files.text("state.json") ?? "{}").id === id
      ? undefined
      : "Unsupported mybundle state",
  relocate: (_path, text, { cwd }) =>
    JSON.stringify({ ...JSON.parse(text), cwd }),
};

// Each turn reads the previous count from its native session, fails when absent, and saves count + 1.
function fixtureScript(
  store: "transcript" | "bundle",
  input: AgentInput,
): string {
  const id = input.continuation?.id ?? "session_1";
  const file =
    store === "transcript"
      ? `path.join(process.env.HOME || os.homedir(), '.mycli', 'sessions', '${id}.jsonl')`
      : `path.join(process.env.HOME || os.homedir(), '.mybundle', 'sessions', '${id}', 'state.json')`;
  return `import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const file = ${file};
let count = 0;
if (${input.continuation !== undefined}) {
  if (!fs.existsSync(file)) { console.error('native session missing'); process.exit(3); }
  count = JSON.parse(fs.readFileSync(file, 'utf8').trim().split('\\n').pop()).count;
}
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify({ id: '${id}', cwd: process.cwd(), count: count + 1 }) + '\\n');
console.log(JSON.stringify({ kind: 'conversation', id: '${id}' }));
console.log(JSON.stringify({ kind: 'text', text: 'count=' + (count + 1) }));`;
}

function externalAgent(
  store: "transcript" | "bundle",
  storage: ConversationStore,
) {
  const adapter: AgentAdapter = {
    name: `external-${store}`,
    resumable: true,
    storage,
    request: (input) => ({
      executable: process.execPath,
      arguments: ["--input-type=module", "-e", fixtureScript(store, input)],
      stdin: input.text ?? "",
    }),
    events: (line) => [JSON.parse(line) as AgentEvent],
  };
  return createAgent({ harness: { kind: "cli", bind: () => adapter } });
}

// A fresh sandbox home per acquisition proves each resume restores the captured session.
function freshHomes(root: string) {
  const host = createLocalSandboxProvider();
  return {
    ...host,
    async acquire(context: Parameters<typeof host.acquire>[0]) {
      const home = await mkdtemp(join(root, "home-"));
      const lease = await host.acquire(context);
      return {
        ...lease,
        home,
        invoke: (command: Parameters<typeof lease.invoke>[0]) =>
          lease.invoke({
            ...command,
            variables: { ...command.variables, HOME: home },
          }),
      };
    },
  };
}

for (const store of ["transcript", "bundle"] as const) {
  test(`an external ${store} format captures and cold-resumes through its own store`, async (t) => {
    const root = await repository(t);
    const transporter = createLocalTransport({
      directory: join(root, "storage"),
    });
    const base =
      store === "transcript"
        ? createTranscriptConversations(transcriptLayout)
        : createSessionBundleConversations(bundleProfile);
    const stores = [
      base,
      createTransportConversations(base, { transporter, namespace: "team" }),
    ];
    for (const [index, storage] of stores.entries()) {
      const agent = externalAgent(store, storage);
      const sandboxProvider = freshHomes(root);
      const first = await dispatch({
        repository: root,
        sandboxProvider,
        agent,
        conversationHome: join(root, `captures-${storage.name}`),
        branch: {
          mode: "named",
          name: `resume-${store}-${index}`,
        },
        brief: { text: "first" },
        logging: false,
      });
      assert.equal(first.text, "count=1");
      assert.equal(first.conversation, "session_1");
      const resumed = await first.resume({ brief: { text: "again" } });
      assert.equal(resumed.text, "count=2");
    }
  });
}

test("session bundle profiles reject hooks that cannot run in the sandbox", () => {
  assert.throws(
    () =>
      createSessionBundleConversations({
        ...bundleProfile,
        relocate(_path, text) {
          return text;
        },
      }),
    /self-contained function expression/,
  );
  assert.throws(
    () =>
      createSessionBundleConversations({
        ...bundleProfile,
        buckets: true,
      }),
    /require a bucket function/,
  );
  assert.throws(
    () => createSessionBundleConversations({ ...bundleProfile, include: /./g }),
    /cannot use the g or y flags/,
  );
  assert.throws(
    () => createTranscriptConversations({ ...transcriptLayout, format: "" }),
    /require a format name/,
  );
});

test("session bundle hooks cannot reach variables outside their own source", async (t) => {
  const root = await repository(t);
  const suffix = "-captured";
  const agent = externalAgent(
    "bundle",
    createSessionBundleConversations({
      ...bundleProfile,
      validate: (files) => (files.text("state.json") + suffix ? undefined : ""),
    }),
  );
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: freshHomes(root),
      agent,
      conversationHome: join(root, "captures"),
      brief: { text: "first" },
      logging: false,
    }),
    (error: unknown) =>
      error instanceof AggregateError &&
      error.errors.some((cause) => /suffix is not defined/.test(String(cause))),
  );
});
