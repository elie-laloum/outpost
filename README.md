# Outpost

[Documentation](https://elie-laloum.github.io/outpost/) · [Français](https://elie-laloum.github.io/outpost/fr/) · [API](https://elie-laloum.github.io/outpost/reference/) · [Changelog](CHANGELOG.md)

Outpost is a TypeScript library for running coding agents in reusable sandboxes, managing their Git workspaces and composing typed workflows. Claude Code, Codex, Antigravity, GitHub Copilot CLI and Kimi Code adapters work with Docker, Podman, Vercel, Daytona or explicit host execution. Each harness authenticates explicitly with your account login or an API key. Claude Code, Codex and Kimi support native capture, resume and fork. Copilot supports capture and resume; Antigravity resumes conversations only while their sandbox remains open. These continuation additions are available in 7.0.0.

Version 8.0.0 adds verification loops, interactive agent tasks, dispatch record and replay, task result caching and quota pauses that resume interrupted conversations. It extends public status, event and fault unions and reclassifies model-provider rate limits as `quota`: see the [changelog](CHANGELOG.md#800) for migration notes.

Version 7.0.0 stabilizes the built-in harness and adds bounded subagents, unified observation, native CLI continuation, signed workflow decisions and recoverable speculation. It extends public TypeScript unions and context contracts: see the [changelog](CHANGELOG.md#700) for migration notes. Firecracker and speculation remain experimental; the [roadmap](https://elie-laloum.github.io/outpost/project/roadmap/) records remaining validation and planned work.

## Get started

Start with [Setup](https://elie-laloum.github.io/outpost/guide/setup/), then [send your first request](https://elie-laloum.github.io/outpost/guide/first-request/). The [Guide](https://elie-laloum.github.io/outpost/guide/introduction/) explains each capability with focused snippets; the [Reference](https://elie-laloum.github.io/outpost/reference/) documents exact API contracts.

Requires Node.js **24+**, Git, a target repository with a commit, and the credentials of your chosen agent. The workflow can live in its own directory. This example uses Docker.

```sh
mkdir workflow1
cd workflow1
npx @elie-laloum/outpost init --yes --repository /path1/repository --install
```

The generated script uses `authentication: "account"`: log in to Codex on the host with file credential storage (`codex -c cli_auth_credentials_store='"file"' login`), and Outpost copies that login into the private sandbox home. For API billing instead, add `--authentication usage`, copy `.env.example` to `.env` and declare `OPENAI_API_KEY`; an empty declaration inherits the matching process variable. Then run the generated script:

```sh
node run.ts "Add validation, run tests and commit the change"
```

`init` creates `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` and a container recipe directly in the workflow directory. Existing package manifests are preserved; explicit CommonJS projects get `run.mts` for compatibility. The script resolves its brief, environment and relative repository paths from its own directory. See [multi-repository workflows](https://elie-laloum.github.io/outpost/guide/parallel-repositories/) to orchestrate several repositories.

Outpost never reads a system keychain. See [authentication](https://elie-laloum.github.io/outpost/guide/access-credentials/) for every agent's account and API-key forms before dispatching.

## Use the library

After preparing the selected agent credentials and provider, library calls follow this shape. For configuration and a first call, see [First request](https://elie-laloum.github.io/outpost/guide/first-request/).

```ts
import {
  createAgent,
  dispatch,
  createCodexHarness,
} from "@elie-laloum/outpost";

const result = await dispatch({
  repository: "/path1/repository",
  agent: createAgent({
    harness: createCodexHarness({ authentication: "account" }),
  }),
  branch: { mode: "integrate" },
  brief: { text: "Fix the failing tests, verify and commit." },
});
console.log(result.branch, result.commits);
```

`repository` selects a local Git checkout; without it, library calls use the current working directory. See [repository paths](https://elie-laloum.github.io/outpost/guide/repository-context/) for external checkouts and paths relative to the workflow script.

Let Outpost drive a model itself with `createHarness({ modelProvider, tools, instructions, limits })` and tools from `defineHarnessTool()`, then compose it with `createAgent({ harness, model })`. Use `defineHarnessSubagent()` to expose a built-in child as a tool with its own history and limits; its token usage also counts toward the parent budget. The built-in contracts and OpenAI and Anthropic integrations are stable in 7.0.0. See [build a custom harness](https://elie-laloum.github.io/outpost/guide/model-loop/) for configuration.

Learn about [sandboxes](https://elie-laloum.github.io/outpost/guide/sandbox-sessions/), [workflows](https://elie-laloum.github.io/outpost/guide/task-dependencies/), [providers](https://elie-laloum.github.io/outpost/guide/execution-backends/) and [recovery](https://elie-laloum.github.io/outpost/guide/failure-recovery/) in the English/French documentation. The [roadmap](https://elie-laloum.github.io/outpost/project/roadmap/) describes future work.

## Development

```sh
npm ci
npm run check
npm run coverage
npm run test:package
npm ci --prefix docs
npm run docs:sync
npm run docs:build
npm run docs:test
```

[GitLab](https://gitlab.elielaloum.com/elielaloum/outpost) is the canonical repository. [GitHub](https://github.com/elie-laloum/outpost) is the mirror running tests, package releases and GitHub Pages. Documentation is validated on main and deployed only after a successful stable release.

See [SECURITY.md](SECURITY.md) for execution boundaries and [LICENSE](LICENSE) for the MIT license.
