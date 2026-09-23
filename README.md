# Outpost

[Français](README.fr.md) · [API](docs/api.md) · [Providers](docs/providers.md) · [Workflows](docs/workflows.md) · [Operations](docs/operations.md) · [Roadmap](ROADMAP.md)

Outpost is a TypeScript library for running coding agents in reusable sandboxes, managing their Git workspaces and composing typed workflows. V1 supports **Codex** and **Claude Code**, with Docker, Podman, Vercel, Daytona and explicit host execution. Agent adapters and sandbox providers are separate extension points.

The source repository is [GitLab](https://gitlab.elielaloum.com/elielaloum/outpost). [GitHub](https://github.com/elie-laloum/outpost) is its push mirror and runs all CI and package releases.

## Requirements

- Node.js **24 or later**, Git, and an existing repository with at least one commit.
- Docker or Podman for local isolation; the appropriate account and optional SDK for a cloud sandbox.
- An authenticated coding agent or its API key. Git hosting credentials are not model credentials.
- ESM imports. TypeScript declarations ship with the package; Node can execute the generated `.ts`/`.mts` scripts directly.

## Install and run

Build from the source checkout:

```sh
npm ci
npm run build
npm pack
```

Install the resulting tarball in your target repository, or use the package from [GitHub Packages](https://github.com/elie-laloum/outpost/packages). Registry configuration is documented in [Operations](docs/operations.md).

```sh
npm install --save-dev /path/to/elie-laloum-outpost-1.1.1.tgz
npx outpost init --yes --agent codex --provider docker --template blank --build
```

Copy `.outpost/.env.example` to `.outpost/.env`. Set `OPENAI_API_KEY` there, or leave its declaration empty to inherit the process value. For Claude, select `--agent claude` and declare `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`. Only declared process variables are imported into isolated sandboxes. Run the generated script:

```sh
node .outpost/run.mts "Add validation and tests for the configuration loader"
```

Initialization uses `run.ts` when the host package declares `"type": "module"`, and `run.mts` otherwise. It never overwrites an existing scaffold. `--install` installs the library and optional provider SDK with the detected package manager. Omit `--build` to build the image later with `npx outpost image build`.

## One dispatch

```ts
import { dispatch, codex } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  agent: codex(),
  provider: docker(),
  branch: { mode: "integrate" },
  brief: { text: "Fix the failing tests, verify the result and commit it." },
});

console.log(result.branch, result.commits, result.conversation);
```

`dispatch` provisions a sandbox, executes the agent, collects changes and native conversation files, integrates commits when requested, and closes owned resources. Uncommitted work is retained. Failure paths preserve separate workspaces for inspection.

| Branch policy                                                 | Behavior                                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `{ mode: "current" }`                                         | Uses the current checkout. This is the mounted/host default.                     |
| `{ mode: "named", name: "feature/validation", from: "main" }` | Creates or reuses a managed worktree for that branch.                            |
| `{ mode: "integrate", from: "main" }`                         | Creates a temporary branch and merges its commits into the original host branch. |

Remote providers require `named` or `integrate`. `from` is optional. Integration refuses a changed host branch and retains the workspace on conflict. A branch checked out elsewhere produces an actionable error.

## Keep a sandbox warm

```ts
import { createSandbox, claude } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: claude({ model: "sonnet", reasoning: "high" }),
  branch: { mode: "named", name: "feature/settings" },
});

const first = await sandbox.dispatch({
  brief: { text: "Implement settings validation." },
});
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
if (tests.status !== 0)
  await first.resume({ brief: { text: "Fix the failing tests." } });
await sandbox.attach();
```

Commands return nonzero statuses; agent dispatches throw on agent failure. `AbortSignal`, command deadlines and idle watchdogs stop the current operation while leaving a warm sandbox usable. A sandbox accepts one active operation at a time. Use separate sandboxes for parallel work.

The default agent is optional for a warm sandbox. Pass `agent` to individual `sandbox.dispatch` or `sandbox.attach` calls to switch between Codex and Claude, or change models, without recreating the environment. Each job receives only its selected adapter's variables.

## Own the workspace separately

```ts
import { openWorkspace, codex, claude } from "@elie-laloum/outpost";

await using workspace = await openWorkspace({
  branch: { mode: "named", name: "feature/shared-work" },
  copies: [".env.test"],
});

await workspace.dispatch({
  agent: codex(),
  brief: { text: "Implement the feature and commit." },
});
await workspace.dispatch({
  agent: claude(),
  brief: { text: "Review the implementation, test and commit fixes." },
});
```

A supplied workspace outlives each sandbox. Its owner closes it. Closing a dirty workspace returns `retainedDirectory`; closing a clean managed workspace removes the worktree. Named branches remain. `workspace.sandbox()` and `workspace.attach()` provide the other lifecycles. Warm integration workspaces can call `sandbox.workspace.integrate()` explicitly.

## Prompts and iteration

Provide exactly one `brief`: literal `text`, or a `file` with optional primitive `values`. Files are reread each pass; inline text is never expanded.

```ts
const result = await dispatch({
  agent: codex(),
  brief: { file: ".outpost/brief.md", values: { OBJECTIVE: "Fix validation" } },
  passes: 5,
  until: ["<outpost>done</outpost>"],
  idleMs: 600_000,
  settleMs: 60_000,
});
```

Files support `{{OBJECTIVE}}`, reserved `{{WORK_BRANCH}}` and `{{BASE_BRANCH}}`, and shell expansion such as `` !`git status --short` ``. Original file commands run concurrently inside the sandbox after setup hooks. Substituted text cannot introduce additional commands. Values inserted into an existing command are shell input: only interpolate trusted values there. Missing variables fail; unused variables warn through `warn`.

Completion markers stop the loop. If the process hangs after a marker, the completion grace period resets on subsequent output and then stops that command. Every turn includes its duration, native transcript path when available and raw token counts (input, cache read, cache creation, output); the result includes aggregate usage and the matched completion marker.

## Structured responses and conversations

```ts
import { response } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: codex(),
  brief: {
    text: "Analyze the repository. Return <report>JSON with an ok boolean</report>.",
  },
  response: response.json({
    tag: "report",
    repairs: 2,
    schema(input) {
      if (
        !input ||
        typeof input !== "object" ||
        !("ok" in input) ||
        typeof input.ok !== "boolean"
      ) {
        throw new Error("Expected an ok boolean");
      }
      return { ok: input.ok };
    },
  }),
});

console.log(result.value.ok);
await result.resume({ brief: { text: "Explain the result." } });
await result.fork({ brief: { text: "Explore a different solution." } });
```

`response.text` extracts tagged text. `response.json` accepts a function or a Standard Schema validator, including asynchronous validation. Structured responses and conversation continuations require one pass. Repairs resume the same conversation. `ResponseError.recovery` exposes the conversation, commits and recovery paths. `recoveryDetails(error)` also retrieves recovery metadata for other failures without replacing cancellation reasons.

Native conversation capture is enabled by default. Transcripts are saved to the host agent's own storage and working-directory fields are rewritten for host resumption. Claude child transcripts are copied on a best-effort basis. Set `saveConversations: false` on an adapter to opt out. Forks create a new conversation; use a separate workspace when filesystem isolation is also required.

Each cold `dispatch({ passes })` provisions a fresh sandbox per pass. `sandbox.dispatch({ passes })` deliberately reuses its environment. Relative brief filenames resolve from the caller’s working directory. Cold result `resume`/`fork` accepts new branch/provider/hook settings; warm result methods retain the sandbox’s settings. See [1.1 migration notes](docs/migration-1.1.md).

## Typed workflows

```ts
import { task, workflow } from "@elie-laloum/outpost";

const inspect = task({
  key: "inspect",
  perform: async () => ({ ready: true }),
});
const implement = task({
  key: "implement",
  after: [inspect],
  retry: { attempts: 2, delayMs: 500 },
  perform: async (context) => context.value(inspect).ready,
});
const result = await workflow("delivery", [inspect, implement]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(implement));
```

The graph validates dependencies and cycles before running. Results are typed and scoped to one execution. Conditions, cooperative cancellation, retries, concurrency limits, observer events and Mermaid diagrams are built in. `agentTask`, `commandTask` and `isolatedTask` connect workflows to sandbox operations. [Workflow guide](docs/workflows.md).

## Issue campaigns

`campaign({ agent, provider, backlog })` loads a backlog, validates a typed plan, allocates a branch per issue and bounds parallel implementation. Review shares each issue sandbox. A merge phase validates the combined work; issue closure occurs only after integration into the host branch. The backlog is refreshed for the next cycle. GitHub and Beads connectors expose list, detail and close operations; custom trackers implement `Backlog`.

[Campaign configuration and starter examples](docs/workflows.md#issue-campaigns).

## Configuration and extension

Provider settings cover environment variables, file/directory mounts, networks, resource limits, devices, extra groups and SELinux labels. Hooks run at workspace readiness and after sandbox creation. The two post-creation hook groups run concurrently. Host commands run in order; sandbox commands run concurrently and cancel their siblings on failure. [Complete API](docs/api.md) and [provider reference](docs/providers.md).

Outpost reads only `.outpost/.env`. Nonempty file values win; empty declarations inherit matching process values. The repository-root `.env` is not imported. Explicit provider and adapter variables override those values. The same variable cannot be declared by both provider and adapter. Logs default to `.outpost/logs`, with `false`, `"stdout"`, custom files and verbose modes available.

Implement `AgentAdapter` to add an agent. Implement `SandboxProvider` directly or use `mountedProvider`/`remoteProvider` to add an execution backend. Domain contracts do not depend on a specific cloud SDK. [Architecture](docs/architecture.md).

## Verification and releases

```sh
npm ci
npm run check
npm run coverage
npm run test:package
```

GitHub Actions runs unit and functional tests on Linux, Windows and macOS, enforces 80% line/function/branch coverage, installs the packed package, and runs real Docker and Podman tests. Cloud contract tests use controlled SDK doubles; live cloud/model checks require the corresponding credentials. No GitLab CI pipeline is required.

Version tags are created on GitLab and mirrored. The release workflow validates the tag, runs CI, publishes GitHub Packages and attaches the installable tarball to a GitHub release. Optional npm publication uses trusted publishing when enabled. [Release procedure and registry setup](docs/operations.md).

## Execution boundary

Docker and Podman mount the selected worktree and Git metadata. Agents can edit that repository and its Git state. This protects unrelated host paths but is not a boundary against a hostile agent attacking the shared repository. Mount only what the task needs. `local()` runs directly on your machine without isolation. Cloud providers synchronize via Git bundles and file transfers; concurrent host changes cause a recovery error instead of being overwritten.

Logs, conversation files and recovery files can contain private prompts or source. Runtime folders and `.env` are excluded from version control. See [Security](SECURITY.md) for the precise boundaries.

MIT licensed. See [LICENSE](LICENSE).
