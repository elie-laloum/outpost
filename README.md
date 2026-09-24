# Outpost

[Documentation](https://elie-laloum.github.io/outpost/) · [Français](https://elie-laloum.github.io/outpost/fr/) · [API](https://elie-laloum.github.io/outpost/reference/) · [Changelog](CHANGELOG.md)

Outpost is a TypeScript library for running coding agents in reusable sandboxes, managing their Git workspaces and composing typed workflows. Claude Code, Codex and Gemini CLI adapters work with Docker, Podman, Vercel, Daytona or explicit host execution. Gemini supports fresh sessions only; native conversation capture, resume and fork are available for Claude Code and Codex.

The source documentation includes additions on main that are not yet published. Package version 3.0.0 remains the latest recorded release; see [Unreleased changes](CHANGELOG.md#unreleased) and the [roadmap](https://elie-laloum.github.io/outpost/project/roadmap/) for their status.

## Get started

Requires Node.js **24+**, Git, a target repository with a commit, and the credentials of your chosen agent. The workflow can live in its own directory. This example uses Docker.

```sh
mkdir workflow1
cd workflow1
npx @elie-laloum/outpost init --yes --repository /path1/repository --install --build
```

Copy `.env.example` to `.env` and declare `OPENAI_API_KEY`. An empty declaration inherits the matching process variable. Then run the generated script:

```sh
node run.ts "Add validation, run tests and commit the change"
```

`init` creates `package.json`, `run.ts`, `brief.md`, `.env.example`, `.gitignore` and a container recipe directly in the workflow directory. Existing package manifests are preserved; explicit CommonJS projects get `run.mts` for compatibility. The script resolves its brief, environment and relative repository paths from its own directory. See [multi-repository workflows](https://elie-laloum.github.io/outpost/workflows/sandbox-tasks/) to orchestrate several repositories.

For Codex API-key authentication, add the login hook from [Connect Codex](https://elie-laloum.github.io/outpost/agents/connect-codex/) before dispatching.

## Use the library

```ts
import { dispatch, codex } from "@elie-laloum/outpost";

const result = await dispatch({
  repository: "/path1/repository",
  agent: codex(),
  branch: { mode: "integrate" },
  brief: { text: "Fix the failing tests, verify and commit." },
});
console.log(result.branch, result.commits);
```

`repository` selects a local Git checkout; without it, library calls use the current working directory. See [repository paths](https://elie-laloum.github.io/outpost/sandboxes/repositories/) for external checkouts and paths relative to the workflow script.

Learn about [sandboxes](https://elie-laloum.github.io/outpost/sandboxes/lifecycle/), [workflows](https://elie-laloum.github.io/outpost/workflows/graph/), [providers](https://elie-laloum.github.io/outpost/providers/overview/) and [recovery](https://elie-laloum.github.io/outpost/operations/recovery/) in the English/French documentation. The [roadmap](https://elie-laloum.github.io/outpost/project/roadmap/) describes future work.

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
