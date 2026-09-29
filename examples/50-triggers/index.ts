// Triggers — a cron schedule or a verified webhook never runs the workflow itself:
// it publishes a job to a queue, and a worker runs the workflow under a checkpoint.
// Everything stays local: the webhooks are signed here, as GitHub and GitLab would sign them.

import { createHmac, randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  commandIssued,
  createCronSchedule,
  createGithubWebhook,
  createGitlabWebhook,
  createLocalTransport,
  createSqliteTaskQueue,
  createWorkflowCheckpointStore,
  defineTask,
  defineWorkflow,
  defineWorkflowJob,
  labelAdded,
  runQueueWorker,
  runSchedules,
  serveTriggers,
  type TriggerEvent,
  type WorkflowJson,
} from "@elie-laloum/outpost";


const state = join(import.meta.dirname, "state");
await rm(state, { recursive: true, force: true });
await mkdir(state, { recursive: true });

const queue = await createSqliteTaskQueue(join(state, "jobs.sqlite"));
const stop = new AbortController();


// 1. Cron expressions are evaluated in a time zone, daylight saving time included.
console.log("1. planification");
const nightly = createCronSchedule("30 2 * * *", { timeZone: "Europe/Paris" });
console.log("  après le 28 mars 2026 :", nightly.next(new Date("2026-03-28T12:00:00Z")).toISOString(), "(2 h 30 n'existe pas le 29)");

try {
  createCronSchedule("0 0 30 2 *");
} catch (error) {
  console.log("  30 février refusé :", (error as Error).message);
}


// 2. Two schedulers share the queue (two replicas): each slot becomes one job, "schedule:<name>:<slot>".
//    At startup, the latest slot less than maxLateMs old is published at once.
const everyMinute = { name: "audit", cron: createCronSchedule("* * * * *"), handler: "audit" };
const replicas = [1, 2].map(() => runSchedules({ queue, schedules: [everyMinute], signal: stop.signal, maxLateMs: 60_000 }));

const published = new Set([`schedule:audit:${everyMinute.cron.previous(new Date()).toISOString()}`]);


// 3. The webhook server: each route checks the signature, then turns the event into a job, or ignores it.
const secret = "github-secret";
const maintainers = new Set(["gitlab:alice"]);

function fromComment(event: TriggerEvent) {
  const command = commandIssued(event, "/outpost");
  if (!command || !maintainers.has(event.actor!)) return undefined; // a signature is not an authorization
  return { handler: "fix", runId: `${command.repository}#${command.number}`, input: { request: command.text } };
}

const server = await serveTriggers({
  queue,
  routes: [
    {
      path: "/github",
      source: createGithubWebhook({ secret }),
      on(event) {
        const issue = labelAdded(event, "outpost:fix");
        if (!issue) return undefined;
        return { handler: "fix", runId: `${issue.repository}#${issue.number}`, input: { issue: issue.number } };
      },
    },
    { path: "/gitlab", source: createGitlabWebhook({ token: "gitlab-token" }), on: fromComment },
  ],
});


// 4. Senders, signed like the real ones. A published job answers 202 with its id.
async function send(path: string, headers: Record<string, string>, body: string) {
  const response = await fetch(`${server.url}${path}`, { method: "POST", headers, body });
  const answer = await response.text();
  if (response.status === 202) published.add(JSON.parse(answer).job);
  return `${response.status} ${answer}`;
}

async function github(delivery: string, payload: object, signingSecret = secret) {
  const body = JSON.stringify(payload);
  const signature = "sha256=" + createHmac("sha256", signingSecret).update(body).digest("hex");
  const headers = { "x-github-event": "issues", "x-github-delivery": delivery, "x-hub-signature-256": signature };
  return send("/github", headers, body);
}

async function gitlab(user: string, note: string) {
  const payload = { object_kind: "note", user: { username: user }, project: { path_with_namespace: "shop/web" }, object_attributes: { note }, issue: { iid: 7 } };
  const headers = { "x-gitlab-token": "gitlab-token", "x-gitlab-event-uuid": randomUUID() };
  return send("/gitlab", headers, JSON.stringify(payload));
}

const labeled = (label: string) => ({
  action: "labeled",
  label: { name: label },
  issue: { number: 42, labels: [{ name: label }] },
  repository: { full_name: "shop/api" },
  sender: { login: "octocat" },
});

console.log("\n2. webhooks");
console.log("  label outpost:fix      :", await github("delivery-1", labeled("outpost:fix")));
console.log("  même livraison rejouée :", await github("delivery-1", labeled("outpost:fix")));
console.log("  autre label            :", await github("delivery-2", labeled("question")));
console.log("  mauvaise signature     :", await github("delivery-3", labeled("outpost:fix"), "wrong"));
console.log("  /outpost par alice     :", await gitlab("alice", "/outpost corrige le lien cassé"));
console.log("  /outpost par mallory   :", await gitlab("mallory", "/outpost supprime tout"));


// 5. The worker: each handler builds its workflow from the job's input and runs it under the job's runId.
const store = createWorkflowCheckpointStore({ transporter: createLocalTransport({ directory: join(state, "checkpoints") }) });

const job = (name: string) =>
  defineWorkflowJob({
    checkpoint: { store, version: "1" },
    workflow: (input: WorkflowJson, { runId }) =>
      defineWorkflow(runId, [defineTask({ key: name, perform: () => console.log(`  ▶ ${name} ${runId}`, JSON.stringify(input)) })]),
  });

console.log("\n3. le worker vide la file");
const worker = runQueueWorker({ queue, worker: "worker-1", handlers: { fix: job("fix"), audit: job("audit") }, signal: stop.signal, pollMs: 200 });

await new Promise((resolve) => setTimeout(resolve, 3000));
stop.abort();
await Promise.all([worker, ...replicas]);
await server.close();

// Each job's value reports its workflow run: runId, versioned checkpoint, status.
console.log("\n4. jobs publiés");
for (const id of published) {
  const run = (await queue.get(id))!.result?.value as { runId: string; version: string; status: string };
  console.log(`  ${id}\n    → run ${run.runId} · ${run.status} · version ${run.version}`);
}
queue.close();
