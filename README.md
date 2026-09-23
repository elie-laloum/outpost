# Outpost

[Documentation](https://elie-laloum.github.io/outpost/) · [Français](https://elie-laloum.github.io/outpost/fr/) · [API](https://elie-laloum.github.io/outpost/reference/) · [Changelog](CHANGELOG.md)

Outpost is a TypeScript library for running coding agents in reusable sandboxes, managing their Git workspaces and composing typed workflows. Claude Code and Codex adapters work with Docker, Podman, Vercel, Daytona or explicit host execution.

## Get started

Requires Node.js **24+**, Git, an existing repository with a commit, and the credentials of your chosen agent. This example uses Docker.

```sh
npm install --save-dev @elie-laloum/outpost
npx outpost init --yes --agent codex --provider docker --template blank --build
```

Copy `.outpost/.env.example` to `.outpost/.env` and declare `OPENAI_API_KEY`. An empty declaration inherits the matching process variable. Then run the generated script:

```sh
node .outpost/run.mts "Add validation, run tests and commit the change"
```

Use `run.ts` for a project with `"type": "module"`; initialization prints the exact command.

## Use the library

```ts
import { dispatch, codex } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: codex(),
  branch: { mode: "integrate" },
  brief: { text: "Fix the failing tests, verify and commit." },
});
console.log(result.branch, result.commits);
```

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
