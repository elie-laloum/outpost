import assert from "node:assert/strict";
import { test } from "node:test";
import { commandIssued, labelAdded } from "../../src/index.ts";
import type { TriggerEvent, WorkflowJson } from "../../src/index.ts";

function event(
  source: string,
  kind: string,
  payload: WorkflowJson,
  action?: string,
): TriggerEvent {
  return {
    source,
    kind,
    ...(action ? { action } : {}),
    delivery: "d",
    payload,
    receivedAt: new Date(0).toISOString(),
  };
}

test("labelAdded reads GitHub issues and pull requests", () => {
  const repository = { full_name: "acme/app" };
  assert.deepEqual(
    labelAdded(
      event(
        "github",
        "issues",
        { label: { name: "outpost:fix" }, issue: { number: 4 }, repository },
        "labeled",
      ),
      "outpost:fix",
    ),
    {
      source: "github",
      target: "issue",
      repository: "acme/app",
      number: 4,
      label: "outpost:fix",
    },
  );
  assert.equal(
    labelAdded(
      event(
        "github",
        "pull_request",
        {
          label: { name: "outpost:fix" },
          pull_request: { number: 5 },
          repository,
        },
        "labeled",
      ),
      "outpost:fix",
    )?.target,
    "pull-request",
  );
  for (const unrelated of [
    event("github", "issues", { label: { name: "other" } }, "labeled"),
    event("github", "issues", { label: { name: "outpost:fix" } }, "unlabeled"),
    event("github", "push", { label: { name: "outpost:fix" } }, "labeled"),
    event(
      "github",
      "issues",
      { label: { name: "outpost:fix" }, issue: {}, repository },
      "labeled",
    ),
    event("slack", "command", {}),
  ])
    assert.equal(labelAdded(unrelated, "outpost:fix"), undefined);
});

test("labelAdded reads GitLab label changes", () => {
  const labels = (previous: string[], current: string[]) => ({
    previous: previous.map((title) => ({ title })),
    current: current.map((title) => ({ title })),
  });
  const payload = (kind: string, previous: string[], current: string[]) =>
    event(
      "gitlab",
      kind,
      {
        object_attributes: { iid: 9 },
        project: { path_with_namespace: "group/app" },
        changes: { labels: labels(previous, current) },
      },
      "update",
    );
  assert.deepEqual(
    labelAdded(payload("merge_request", ["bug"], ["bug", "fix"]), "fix"),
    {
      source: "gitlab",
      target: "pull-request",
      repository: "group/app",
      number: 9,
      label: "fix",
    },
  );
  assert.equal(
    labelAdded(payload("issue", [], ["fix"]), "fix")?.target,
    "issue",
  );
  assert.equal(
    labelAdded(payload("issue", ["fix"], ["fix"]), "fix"),
    undefined,
  );
  assert.equal(labelAdded(payload("issue", ["fix"], []), "fix"), undefined);
  assert.equal(
    labelAdded(event("gitlab", "issue", { changes: {} }), "fix"),
    undefined,
  );
});

test("commandIssued reads new comments and Slack commands", () => {
  const repository = { full_name: "acme/app" };
  assert.deepEqual(
    commandIssued(
      event(
        "github",
        "issue_comment",
        {
          comment: { body: "Thanks!\r\n  /outpost fix  the parser \nbye" },
          issue: { number: 3, pull_request: { url: "x" } },
          repository,
        },
        "created",
      ),
      "/outpost",
    ),
    {
      source: "github",
      text: "fix  the parser",
      repository: "acme/app",
      number: 3,
      target: "pull-request",
    },
  );
  assert.equal(
    commandIssued(
      event(
        "github",
        "issue_comment",
        { comment: { body: "/outposted" } },
        "created",
      ),
      "/outpost",
    ),
    undefined,
  );
  assert.equal(
    commandIssued(
      event(
        "github",
        "issue_comment",
        { comment: { body: "/outpost go" } },
        "edited",
      ),
      "/outpost",
    ),
    undefined,
  );
  assert.deepEqual(
    commandIssued(
      event("gitlab", "note", {
        object_attributes: { note: "/outpost" },
        issue: { iid: 11 },
        project: { path_with_namespace: "group/app" },
      }),
      "/outpost",
    ),
    {
      source: "gitlab",
      text: "",
      repository: "group/app",
      number: 11,
      target: "issue",
    },
  );
  assert.equal(
    commandIssued(
      event(
        "gitlab",
        "note",
        {
          object_attributes: { note: "/outpost run" },
          merge_request: { iid: 2 },
        },
        "create",
      ),
      "/outpost",
    )?.target,
    "pull-request",
  );
  assert.equal(
    commandIssued(
      event(
        "gitlab",
        "note",
        { object_attributes: { note: "/outpost run" } },
        "update",
      ),
      "/outpost",
    ),
    undefined,
  );
  assert.deepEqual(
    commandIssued(
      event("slack", "command", { text: " fix 42 " }, "/outpost"),
      "/outpost",
    ),
    { source: "slack", text: "fix 42" },
  );
  assert.equal(
    commandIssued(event("slack", "command", {}, "/other"), "/outpost"),
    undefined,
  );
  assert.equal(
    commandIssued(event("standard", "webhook", {}), "/outpost"),
    undefined,
  );
  assert.throws(
    () => commandIssued(event("slack", "command", {}), "two words"),
    /single word/,
  );
});
