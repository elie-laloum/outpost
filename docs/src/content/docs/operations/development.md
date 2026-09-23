---
title: "Develop and verify Outpost"
description: "Develop and verify Outpost — Outpost"
sidebar:
  order: 4
---

The writable source repository is [GitLab](https://gitlab.elielaloum.com/elielaloum/outpost). GitHub is the push mirror used for CI, packages and documentation hosting.

```sh
npm ci
npm run check
npm run coverage
npm run test:package
npm run format:check
```

`check` runs architecture checks, TypeScript checking, unit/functional tests and the package build. Coverage enforces at least 80% for lines, functions and branches. Erased type-only modules are excluded from runtime coverage; type checking and the packed-package consumer validate declarations.

Unit and functional tests use fixture agents and temporary repositories, without paid model access. The package smoke test installs the built archive in an isolated project, checks imports and declarations, and runs initialization. Container tests require a real Docker/Podman engine and the generated `outpost-ci:latest` image.

CI checks Linux, Windows and macOS, plus real Docker and Podman execution. Cloud SDK contracts use controlled doubles; live cloud/model availability requires separate account credentials and testing.

## Documentation development

```sh
npm ci --prefix docs
npm run docs:sync
npm run docs:check
npm run docs:dev
```

Documentation source pages are Markdown in `docs/src/content/docs`, with French counterparts under `fr`. Add both languages for every guide. API pages and changelog copies are synchronized from package declarations and the root changelog. Do not edit generated contracts by hand; change the source and run `docs:sync`.

`npm run docs:build` builds the static site; `npm run docs:test` validates emitted links, language routes, search assets and code examples. CI validates documentation changes on `main` and pull requests without deploying them. Releases publish the site.
