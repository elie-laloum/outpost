---
title: "Packages and documentation releases"
description: "Packages and documentation releases — Outpost"
sidebar:
  order: 5
---

Create source commits and version tags on GitLab. The push mirror forwards them to GitHub, where Actions performs verification and publication. Do not publish source changes directly to the GitHub mirror.

## Release procedure

1. Update root `package.json`, its lockfile and `CHANGELOG.md` to the next stable version.
2. Run `npm run docs:sync` and all relevant checks; commit on GitLab.
3. Wait for CI on the mirrored commit to pass.
4. Create `v<version>` on GitLab at that exact commit.
5. Verify package publication, the attached GitHub release archive and the Pages deployment.

`Release` verifies the tag/version, runs reusable CI, builds the package, publishes GitHub Packages and creates a GitHub release with its `.tgz`. npm publication uses OIDC trusted publishing and provenance when `NPM_PUBLISH=true`. Both registries receive repository metadata matching the GitHub workflow origin; GitLab remains the source of truth.

npm trust must be configured for owner `elie-laloum`, repository `outpost`, workflow `release.yml`. No publishing token belongs in tracked files. Versions are immutable: inspect partial publication before retrying and use a new patch version for changed content. Never move a released tag.

## One documentation site

The site is [elie-laloum.github.io/outpost](https://elie-laloum.github.io/outpost/). There is no separate preview repository or preview deployment. `main` and pull requests only validate docs. A successful stable release deploys documentation from that release’s exact source commit, with English at the root and French under `/fr/`.

The deployment checks that the release is still the latest published stable version before updating Pages. It uses the repository’s `github-pages` environment, `pages: write` and `id-token: write`; ordinary validation has read-only permissions. Enable Pages with GitHub Actions as its source.
