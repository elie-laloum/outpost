<p align="center">
  <a href="https://elie-laloum.github.io/outpost/">
    <img src="docs/src/assets/outpost-logo.png" alt="Outpost" width="180">
  </a>
</p>

<h1 align="center">Outpost</h1>

<p align="center"><strong>Coding agents. Isolated workspaces. Workflows in TypeScript.</strong></p>

<p align="center">
  <a href="https://github.com/elie-laloum/outpost/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/elie-laloum/outpost/ci.yml?branch=main&amp;label=tests" alt="Tests: CI status on main"></a>
  <a href="https://github.com/elie-laloum/outpost/blob/main/package.json"><img src="https://img.shields.io/badge/coverage%20gate-%E2%89%A580%25-586475" alt="Coverage gate: at least 80% lines, branches and functions"></a>
  <a href="https://www.npmjs.com/package/@elie-laloum/outpost"><img src="https://img.shields.io/npm/v/%40elie-laloum%2Foutpost" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-586475" alt="License: MIT"></a>
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a> ·
  <a href="https://elie-laloum.github.io/outpost/">Documentation</a> ·
  <a href="https://elie-laloum.github.io/outpost/reference/">API reference</a> ·
  <a href="https://elie-laloum.github.io/outpost/fr/">Français</a>
</p>

Outpost is a TypeScript library and CLI for running coding agents in sandboxes and composing their work. Give an agent a task, choose its execution environment, and collect its answer, commits and usage. Start with one request; add parallel tasks, verification loops and human decisions as your workflow grows.

## Why Outpost?

- **Choose your agent and sandbox independently.** Run Claude Code, Codex, Antigravity, GitHub Copilot CLI or Kimi Code with Docker, Podman, Vercel or Daytona.
- **Keep Git work explicit.** Give tasks their own worktrees, retain branches for review, or opt into local integration. Compose work across repositories with declared dependencies.
- **Write workflows as code.** Connect typed tasks, validate structured responses, enforce budgets and pause for human input or approval.
- **Continue work across runs.** Capture supported agent conversations, resume checkpointed workflows and recover interrupted work with explicit replay controls.
- **Build your own agent loop.** Use the built-in harness with OpenAI or Anthropic model providers, sandbox tools and bounded subagents.

## Quickstart

You need **Node.js 24+**, **Git**, a repository with at least one commit, and **Docker** running. This example uses Codex with account authentication: prepare its host login using the [setup guide](https://elie-laloum.github.io/outpost/guide/setup/) before running a task. [Authentication](https://elie-laloum.github.io/outpost/guide/authentication/) covers other agents and API-key billing.

Create a workflow directory and point it at your checkout:

```sh
mkdir my-workflow
cd my-workflow
npx @elie-laloum/outpost init --yes --repository /absolute/path/to/repository --image outpost:dev --install
```

This installs the workflow dependencies, generates `run.ts`, `brief.md` and configuration files, and builds the Docker image. The first build downloads the agent CLIs. Use `--no-build` if the image already exists. Existing package manifests are preserved; explicit CommonJS projects get `run.mts`.

Run your first task:

```sh
node run.ts "Describe this repository and suggest one small improvement. Do not edit files."
```

The generated script prints the branch, collected commits and conversation reference. It uses **local branch integration**: when you later ask the agent to change and commit code, those commits are integrated into the target checkout. Use a named branch, as below, to keep changes separate for review. See [branch strategies](https://elie-laloum.github.io/outpost/guide/repository-and-branch/).

## Use the library

The workflow is ordinary TypeScript. After the setup above, save this as `task.mts` next to the generated script, replace the repository path, and run `node task.mts`:

```ts
import {
  createAgent,
  createCodexHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  repository: "/absolute/path/to/repository",
  agent: createAgent({
    harness: createCodexHarness({ authentication: "account" }),
  }),
  sandboxProvider: createDockerSandboxProvider({ image: "outpost:dev" }),
  branch: { mode: "named", name: "outpost/fix-tests" },
  brief: {
    text: "Fix the failing tests, run them to verify and commit the change.",
  },
});

console.log(result.text);
console.log(result.branch, result.commits);
console.log(result.usage);
```

`dispatch()` closes the sandbox it allocates; the named branch remains for review. Use a fresh branch name for each independent task. The agent’s answer is not an enforced test result: add explicit verification when checks must gate integration.

## Choose your building blocks

| You want to…                                        | Start here                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Choose an agent, model and credentials              | [Agent configuration](https://elie-laloum.github.io/outpost/guide/choose-an-agent/)              |
| Run locally in containers or in the cloud           | [Execution backends](https://elie-laloum.github.io/outpost/guide/choose-a-sandbox/)              |
| Reuse a sandbox across commands and agent turns     | [Sandbox sessions](https://elie-laloum.github.io/outpost/guide/sandbox-sessions/)                |
| Connect tasks and run independent work in parallel  | [Task dependencies](https://elie-laloum.github.io/outpost/guide/task-dependencies/)              |
| Coordinate changes across repositories              | [Multi-repository workflows](https://elie-laloum.github.io/outpost/guide/multiple-repositories/) |
| Return data your application can validate           | [Validated output](https://elie-laloum.github.io/outpost/guide/typed-responses/)                 |
| Build an agent with your own tools and instructions | [Custom harness](https://elie-laloum.github.io/outpost/guide/harness/)                           |
| Resume or recover interrupted work                  | [Failure recovery](https://elie-laloum.github.io/outpost/guide/recovery/)                        |

The [Guide](https://elie-laloum.github.io/outpost/guide/introduction/) explains behavior with focused examples. The [Reference](https://elie-laloum.github.io/outpost/reference/) documents exact contracts. Both are available in English and French.

## Boundaries worth knowing

Account login and API-key authentication are explicit choices with different billing. Outpost never reads a system keychain. Credentials are made available to the chosen agent in its execution environment.

Conversation support varies: Claude Code, Codex and Kimi support capture, resume and fork; Copilot supports capture and resume; Antigravity resumes only in its existing sandbox.

Docker and Podman mount the selected workspace and Git metadata by default. These mounts are not an adversarial security boundary. Cloud providers receive repository data and declared credentials; explicit local execution runs on the host without isolation. Read [SECURITY.md](SECURITY.md) before choosing an environment for untrusted code.

Speculation remains experimental. See the [roadmap](https://elie-laloum.github.io/outpost/project/roadmap/) for validation limits and planned work, and the [changelog](CHANGELOG.md) for version history and migration notes.

## Development and contributions

Bug reports, reproducible cases and focused contributions are welcome through [GitHub issues](https://github.com/elie-laloum/outpost/issues). Read [AGENTS.md](AGENTS.md) for architecture, conventions and the checks required for your change.

```sh
bun install --frozen-lockfile
bun run check
bun run coverage
bun run test:package
```

CI checks Windows, macOS and Linux, plus real Docker/Podman execution and Redis queue behavior. The coverage gate requires **at least 80% lines, branches and functions**; the badge shows that configured minimum, not a measured coverage percentage. Coverage reports are uploaded as CI artifacts. Routine tests do not require paid model calls.

[GitLab](https://gitlab.elielaloum.com/elielaloum/outpost) is the canonical repository. [GitHub](https://github.com/elie-laloum/outpost) is the public mirror and runs CI, package releases and documentation deployment. The documentation site deploys after eligible stable releases.

Created by **Elie Laloum**. Released under the [MIT license](LICENSE).
