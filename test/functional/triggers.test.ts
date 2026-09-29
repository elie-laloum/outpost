import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createHmac, randomBytes } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createGithubWebhook,
  createGitlabWebhook,
  serveTriggers,
  createSlackSource,
  createSqliteTaskQueue,
  createStandardWebhook,
} from "../../src/index.ts";
import type {
  QueueRequest,
  TaskQueue,
  TriggerEvent,
  TriggerFailure,
  TriggerRoute,
  TriggerServerOptions,
} from "../../src/index.ts";

const githubSecret = "github-test-secret";
const slackSecret = "slack-test-secret";
const standardSecret = `whsec_${randomBytes(24).toString("base64")}`;
const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

async function fixture(
  t: TestContext,
  routes: readonly TriggerRoute[],
  extra: Partial<TriggerServerOptions> = {},
) {
  const directory = await mkdtemp(join(tmpdir(), "outpost-triggers-"));
  const queue = await createSqliteTaskQueue(join(directory, "queue.sqlite"));
  const failures: { failure: TriggerFailure; error: string }[] = [];
  const server = await serveTriggers({
    queue,
    routes,
    onError: (error, failure) =>
      failures.push({ failure, error: String(error) }),
    ...extra,
  });
  t.after(async () => {
    await server.close();
    queue.close();
    await rm(directory, { recursive: true, force: true });
  });
  async function post(
    path: string,
    body: string,
    headers: Record<string, string>,
  ) {
    const response = await fetch(`${server.url}${path}`, {
      method: "POST",
      headers,
      body,
    });
    return { status: response.status, text: await response.text() };
  }
  return { queue, server, failures, post };
}

function github(body: string, event = "issues", delivery = "d-1") {
  return {
    "content-type": "application/json",
    "x-github-event": event,
    "x-github-delivery": delivery,
    "x-hub-signature-256": `sha256=${createHmac("sha256", githubSecret).update(body).digest("hex")}`,
  };
}

function standard(
  body: string,
  id = "msg_1",
  timestamp = Math.floor(Date.now() / 1000),
  secret = standardSecret,
) {
  const key = Buffer.from(secret.slice(6), "base64");
  const signature = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
  return {
    "content-type": "application/json",
    "webhook-id": id,
    "webhook-timestamp": String(timestamp),
    "webhook-signature": `v1,invalid v1,${signature}`,
  };
}

function slack(body: string, timestamp = Math.floor(Date.now() / 1000)) {
  const signature = createHmac("sha256", slackSecret)
    .update(`v0:${timestamp}:${body}`)
    .digest("hex");
  return {
    "content-type": "application/x-www-form-urlencoded",
    "x-slack-request-timestamp": String(timestamp),
    "x-slack-signature": `v0=${signature}`,
  };
}

const labeled = JSON.stringify({
  action: "labeled",
  label: { name: "outpost:fix" },
  issue: { number: 42 },
  repository: { full_name: "acme/app" },
  sender: { login: "octocat" },
});

function issueRoute(events: TriggerEvent[] = []): TriggerRoute {
  return {
    path: "/github",
    source: createGithubWebhook({ secret: githubSecret }),
    on(event) {
      events.push(event);
      if (event.action !== "labeled") return undefined;
      return { handler: "fix", runId: "issue-42", input: { issue: 42 } };
    },
  };
}

test("GitHub deliveries are verified, normalized and published once", async (t) => {
  const events: TriggerEvent[] = [];
  const { queue, post, failures } = await fixture(t, [issueRoute(events)]);
  const accepted = await post("/github", labeled, github(labeled));
  assert.equal(accepted.status, 202);
  assert.deepEqual(JSON.parse(accepted.text), { job: "trigger:/github:d-1" });
  assert.equal((await post("/github", labeled, github(labeled))).status, 202);
  const job = await queue.get("trigger:/github:d-1");
  assert.deepEqual(plain(job && { handler: job.handler, input: job.input }), {
    handler: "fix",
    input: { runId: "issue-42", input: { issue: 42 } },
  });
  assert.equal(
    (await queue.claim({ worker: "w", handlers: ["fix"], leaseMs: 1_000 }))?.id,
    job?.id,
  );
  assert.equal(
    await queue.claim({ worker: "w", handlers: ["fix"], leaseMs: 1_000 }),
    undefined,
    "a redelivery does not add a job",
  );
  assert.deepEqual(
    {
      source: events[0]?.source,
      delivery: events[0]?.delivery,
      kind: events[0]?.kind,
      action: events[0]?.action,
      actor: events[0]?.actor,
    },
    {
      source: "github",
      delivery: "d-1",
      kind: "issues",
      action: "labeled",
      actor: "github:octocat",
    },
  );
  const opened = JSON.stringify({ action: "opened" });
  assert.equal(
    (await post("/github", opened, github(opened, "issues", "d-2"))).status,
    204,
  );
  const tampered = labeled.replace("42", "43");
  assert.equal((await post("/github", tampered, github(labeled))).status, 401);
  const { "x-github-delivery": _, ...missing } = github(labeled);
  assert.equal((await post("/github", labeled, missing)).status, 401);
  assert.equal(
    (
      await post("/github", labeled, {
        ...github(labeled),
        "x-hub-signature-256": "sha1=abc",
      })
    ).status,
    401,
  );
  assert.deepEqual(
    failures.map((entry) => entry.failure.stage),
    ["verify", "verify", "verify"],
  );
  assert.ok(failures.every((entry) => !entry.error.includes(githubSecret)));
});

test("GitHub accepts form payloads and rotated secrets", async (t) => {
  let secrets = ["old-secret", githubSecret];
  const { post } = await fixture(t, [
    {
      ...issueRoute(),
      source: createGithubWebhook({ secret: async () => secrets }),
    },
  ]);
  const form = new URLSearchParams({ payload: labeled }).toString();
  assert.equal(
    (
      await post("/github", form, {
        ...github(form),
        "content-type": "application/x-www-form-urlencoded",
      })
    ).status,
    202,
  );
  secrets = ["newer-secret"];
  assert.equal(
    (await post("/github", labeled, github(labeled, "issues", "d-9"))).status,
    401,
  );
  secrets = [];
  assert.equal(
    (await post("/github", labeled, github(labeled, "issues", "d-10"))).status,
    401,
    "an empty secret source denies access",
  );
  assert.throws(() => createGithubWebhook({ secret: "" }), /secret/);
});

test("GitLab signing tokens and legacy tokens identify deliveries", async (t) => {
  const payload = JSON.stringify({
    object_kind: "issue",
    user: { username: "maintainer" },
    object_attributes: { iid: 7, action: "update" },
  });
  const seen: TriggerEvent[] = [];
  const route = (path: string, source: TriggerRoute["source"]) => ({
    path,
    source,
    on: (event: TriggerEvent) => {
      seen.push(event);
      return { handler: "fix", runId: `gitlab-${event.delivery}` };
    },
  });
  const { post, queue } = await fixture(t, [
    route("/gitlab", createGitlabWebhook({ signingToken: standardSecret })),
    route("/legacy", createGitlabWebhook({ token: "legacy-token" })),
  ]);
  const headers = {
    ...standard(payload, "gl-1"),
    "x-gitlab-event": "Issue Hook",
  };
  assert.equal((await post("/gitlab", payload, headers)).status, 202);
  assert.ok(await queue.get("trigger:/gitlab:gl-1"));
  assert.deepEqual(
    [seen[0]?.kind, seen[0]?.action, seen[0]?.actor],
    ["issue", "update", "gitlab:maintainer"],
  );
  const stale = standard(payload, "gl-2", Math.floor(Date.now() / 1000) - 600);
  assert.equal((await post("/gitlab", payload, stale)).status, 401);
  const wrongKey = standard(
    payload,
    "gl-3",
    undefined,
    `whsec_${randomBytes(24).toString("base64")}`,
  );
  assert.equal((await post("/gitlab", payload, wrongKey)).status, 401);
  const legacy = {
    "content-type": "application/json",
    "x-gitlab-token": "legacy-token",
    "x-gitlab-event": "Push Hook",
    "idempotency-key": "idem-1",
  };
  const push = JSON.stringify({ user_username: "dev" });
  assert.equal((await post("/legacy", push, legacy)).status, 202);
  assert.ok(await queue.get("trigger:/legacy:idem-1"));
  assert.deepEqual(
    [seen[1]?.kind, seen[1]?.actor],
    ["Push Hook", "gitlab:dev"],
  );
  const { "idempotency-key": _, ...uuid } = legacy;
  assert.equal(
    (await post("/legacy", push, { ...uuid, "x-gitlab-event-uuid": "uuid-1" }))
      .status,
    202,
  );
  assert.equal(
    (await post("/legacy", push, { ...legacy, "x-gitlab-token": "wrong" }))
      .status,
    401,
  );
  assert.throws(
    () => createGitlabWebhook({ signingToken: standardSecret, toleranceMs: 0 }),
    /tolerance/,
  );
});

test("Slack commands and interactions are signed and acknowledged with 200", async (t) => {
  const seen: TriggerEvent[] = [];
  const { post, queue } = await fixture(t, [
    {
      path: "/slack",
      source: createSlackSource({ signingSecret: slackSecret }),
      on(event) {
        seen.push(event);
        if (event.kind !== "command") return undefined;
        return { handler: "fix", runId: "slack-run" };
      },
    },
  ]);
  const command = new URLSearchParams({
    command: "/outpost",
    text: "fix 42",
    user_id: "U123",
    trigger_id: "t.1",
  }).toString();
  const accepted = await post("/slack", command, slack(command));
  assert.deepEqual(accepted, { status: 200, text: "" });
  assert.ok(await queue.get("trigger:/slack:t.1"));
  assert.deepEqual(
    [seen[0]?.kind, seen[0]?.action, seen[0]?.actor],
    ["command", "/outpost", "slack:U123"],
  );
  const interaction = new URLSearchParams({
    payload: JSON.stringify({
      type: "block_actions",
      user: { id: "U9" },
      trigger_id: "t.2",
    }),
  }).toString();
  assert.equal(
    (await post("/slack", interaction, slack(interaction))).status,
    200,
  );
  assert.deepEqual(
    [seen[1]?.kind, seen[1]?.actor, seen[1]?.delivery],
    ["block_actions", "slack:U9", "t.2"],
  );
  const stale = slack(command, Math.floor(Date.now() / 1000) - 3_600);
  assert.equal((await post("/slack", command, stale)).status, 401);
  const noTrigger = new URLSearchParams({ command: "/outpost" }).toString();
  assert.equal((await post("/slack", noTrigger, slack(noTrigger))).status, 401);
});

test("Standard Webhooks sources verify any compliant sender", async (t) => {
  const { post, queue } = await fixture(t, [
    {
      path: "/billing",
      source: createStandardWebhook({
        secret: standardSecret,
        source: "billing",
      }),
      on: (event) => ({
        handler: "sync",
        runId: `${event.source}-${event.kind}`,
      }),
    },
  ]);
  const body = JSON.stringify({ type: "invoice.paid" });
  assert.equal(
    (await post("/billing", body, standard(body, "m-1"))).status,
    202,
  );
  assert.deepEqual(plain((await queue.get("trigger:/billing:m-1"))?.input), {
    runId: "billing-invoice.paid",
    input: null,
  });
  const plainSecret = await fixture(t, [
    {
      path: "/plain",
      source: createStandardWebhook({ secret: "not-a-whsec-secret" }),
      on: () => ({ handler: "sync", runId: "x" }),
    },
  ]);
  assert.equal(
    (await plainSecret.post("/plain", body, standard(body, "m-2"))).status,
    401,
  );
});

test("the server maps routing, size and queue failures to HTTP statuses", async (t) => {
  let fail: string | undefined;
  const flaky: TaskQueue = {
    enqueue: async (request: QueueRequest) => {
      if (fail) throw new Error(fail);
      return { ...request, status: "pending", fence: 0 };
    },
  } as unknown as TaskQueue;
  const routes: TriggerRoute[] = [
    issueRoute(),
    {
      path: "/broken",
      source: createGithubWebhook({ secret: githubSecret }),
      on: () => {
        throw new Error("route bug");
      },
    },
    {
      path: "/invalid",
      source: createGithubWebhook({ secret: githubSecret }),
      on: () => ({ handler: "fix", runId: "" }),
    },
  ];
  const { post, server, failures } = await fixture(t, routes, {
    queue: flaky,
    maxBytes: 2_048,
  });
  assert.equal((await post("/missing", labeled, github(labeled))).status, 404);
  assert.equal((await fetch(`${server.url}/github`)).status, 405);
  const large = JSON.stringify({ padding: "x".repeat(4_096) });
  assert.equal((await post("/github", large, github(large))).status, 413);
  assert.equal((await post("/broken", labeled, github(labeled))).status, 500);
  assert.equal((await post("/invalid", labeled, github(labeled))).status, 500);
  fail = "queue offline";
  assert.equal((await post("/github", labeled, github(labeled))).status, 503);
  fail = undefined;
  assert.equal((await post("/github", labeled, github(labeled))).status, 202);
  assert.deepEqual(
    failures.map(({ failure }) => [
      failure.path,
      failure.stage,
      failure.delivery,
    ]),
    [
      ["/broken", "route", "d-1"],
      ["/invalid", "route", "d-1"],
      ["/github", "enqueue", "d-1"],
    ],
  );
});

test("observer failures do not change responses and options are validated", async (t) => {
  const { post } = await fixture(t, [issueRoute()], {
    onError: () => {
      throw new Error("observer bug");
    },
  });
  assert.equal((await post("/github", "{}", github("{}x"))).status, 401);
  const queue = {} as TaskQueue;
  const source = createGithubWebhook({ secret: githubSecret });
  const on = () => undefined;
  for (const routes of [
    [],
    [{ path: "github", source, on }],
    [
      { path: "/a", source, on },
      { path: "/a", source, on },
    ],
    [{ path: "/a", source: {} as typeof source, on }],
  ])
    await assert.rejects(serveTriggers({ queue, routes }));
  await assert.rejects(
    serveTriggers({ queue, routes: [issueRoute()], maxBytes: 0 }),
  );
});
