---
title: "Installation"
description: "Installation — Outpost"
sidebar:
  order: 1
---

## Requirements

- Node.js **24+** and Git on the host.
- An existing Git repository with at least one commit and a configured commit identity.
- A running Docker or Podman engine for local isolation, or credentials for a supported cloud provider.
- Credentials for your coding agent. Git hosting credentials do not authenticate the model.

Outpost is ESM-only. Use an `.mts` script, or `.ts` in a package with `"type": "module"`. Node 24 executes the examples directly; no TypeScript runner is required. Do not place executable examples inside `node_modules`.

## Install from npm

```sh
npm install --save-dev @elie-laloum/outpost
npx outpost --help
```

Install in the repository you will work on. To pin a release, append its version to the package name. Docker, Podman and local execution need no cloud SDK dependency.

## Cloud dependencies

```sh
npm install @vercel/sandbox
```

Use `@daytona/sdk` instead for Daytona. Import providers through their dedicated `@elie-laloum/outpost/providers/*` subpaths; this keeps unrelated cloud SDKs optional. See [provider selection](../../../../guide/environment/providers/overview/).

## Alternative registries and source builds

The `.tgz` attached to a [GitHub release](https://github.com/elie-laloum/outpost/releases) can be installed with `npm install --save-dev ./downloaded-package.tgz`. GitHub Packages is also available; configure `@elie-laloum:registry=https://npm.pkg.github.com` in `.npmrc` and authenticate separately. Never commit registry tokens.

From the source checkout, run `npm ci`, `npm run build` and `npm pack`, then install that archive in your project. The package contains JavaScript, declarations, source maps and the license; the documentation website has its own dependencies.

Continue with the [quick start](../../../../guide/start/quickstart/).
