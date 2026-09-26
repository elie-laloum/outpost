# Outpost

[Documentation](https://elie-laloum.github.io/outpost/) · [Français](https://elie-laloum.github.io/outpost/fr/) · [API](https://elie-laloum.github.io/outpost/reference/) · [Changelog](CHANGELOG.md)

Outpost is a TypeScript library for running coding agents in reusable sandboxes, managing their Git workspaces and composing typed workflows. Claude Code, Codex and Gemini CLI adapters work with Docker, Podman, Vercel, Daytona or explicit host execution. Gemini supports fresh sessions only; native conversation capture, resume and fork are available for Claude Code and Codex.

Version 4.2.0 adds local/S3 storage transports, an optional BullMQ/Redis task queue and experimental direct text model calls. The bilingual documentation now separates practical guides from the API reference. Direct model calls do not yet execute tools or edit repositories. See the [changelog](CHANGELOG.md#420) for details and the [roadmap](https://elie-laloum.github.io/outpost/project/roadmap/) for remaining validation and upcoming priorities.

The working tree also contains the **unreleased agent/harness API refactor** shown in the library examples below. It requires a package built from this checkout; the published 4.2.0 API has not been replaced. See the Unreleased changelog entry.

## Get started

New to Outpost? Follow the [complete first-run workshop](https://elie-laloum.github.io/outpost/guide/start/quickstart/): choose Codex or Claude and account or API-key access, create a disposable TypeScript repository, then fix and verify a real test. The [Guide](https://elie-laloum.github.io/outpost/guide/) teaches the concepts; the [Reference](https://elie-laloum.github.io/outpost/reference/) explains exact contracts. Every [cookbook recipe](https://elie-laloum.github.io/outpost/guide/cookbook/) includes its own preparation and runnable code.

Requires Node.js **24+**, Git, a target repository with a commit, and the credentials of your chosen agent. The workflow can live in its own directory. This example uses Docker.

```sh
mkdir workflow1
cd workflow1
npx @elie-laloum/outpost init --yes --repository /path1/repository --install
```

Copy `.env.example` to `.env` and declare `OPENAI_API_KEY`. An empty declaration inherits the matching process variable. Then run the generated script:

```sh
node run.ts "Add validation, run tests and commit the change"
```

`init` creates `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` and a container recipe directly in the workflow directory. Existing package manifests are preserved; explicit CommonJS projects get `run.mts` for compatibility. The script resolves its brief, environment and relative repository paths from its own directory. See [multi-repository workflows](https://elie-laloum.github.io/outpost/guide/workflows/sandbox-tasks/) to orchestrate several repositories.

Generated Codex API-key workflows prepare login inside the sandbox. For account login and credential storage, see [Connect Codex](https://elie-laloum.github.io/outpost/guide/agents/connect-codex/) before dispatching.

## Use the library

After preparing the selected agent credentials and provider, library calls follow this shape. For a fully runnable version with explicit authentication, use the [dispatch workshop](https://elie-laloum.github.io/outpost/guide/agents/dispatch/).

```ts
import { agent, dispatch, codexHarness } from "@elie-laloum/outpost";

const result = await dispatch({
  repository: "/path1/repository",
  agent: agent({ harness: codexHarness({}) }),
  branch: { mode: "integrate" },
  brief: { text: "Fix the failing tests, verify and commit." },
});
console.log(result.branch, result.commits);
```

`repository` selects a local Git checkout; without it, library calls use the current working directory. See [repository paths](https://elie-laloum.github.io/outpost/guide/environment/repositories/) for external checkouts and paths relative to the workflow script.

Let Outpost drive a model itself with `harness({ modelProvider, tools, instructions, limits })` and tools from `defineHarnessTool()`, then compose it with `agent({ harness, model })`. See [build a custom harness](https://elie-laloum.github.io/outpost/guide/agents/harness/) for a complete example.

Learn about [sandboxes](https://elie-laloum.github.io/outpost/guide/environment/lifecycle/), [workflows](https://elie-laloum.github.io/outpost/guide/workflows/graph/), [providers](https://elie-laloum.github.io/outpost/guide/environment/providers/overview/) and [recovery](https://elie-laloum.github.io/outpost/guide/operations/recovery/) in the English/French documentation. The [roadmap](https://elie-laloum.github.io/outpost/project/roadmap/) describes future work.

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
