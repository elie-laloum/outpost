---
title: "Changelog"
description: "Changelog — Outpost API"
sidebar:
  order: 2
---

The release notes below are synchronized from the root `CHANGELOG.md`, the single source of release history.

## 1.1.3

- Replace the flat documentation with an Astro Starlight site in English and French, with English as the default language.
- Organize usage into focused guides and generate checked reference pages for every public API export and supporting contract.
- Validate translations, TypeScript examples, rendered links, navigation and search assets in CI.
- Deploy one GitHub Pages site after successful stable releases, protecting it from older release deployments.
- Move the French getting-started content and roadmap into the documentation, retain the root changelog and remove obsolete migration and contribution files.
- Keep documentation tooling out of the published library archive.

## 1.1.2

- Match npm package repository metadata to the GitHub build origin for provenance verification. GitLab remains the canonical source repository.

## 1.1.1

- Separate Claude and Codex adapters, request builders and protocol decoders; preserve unknown events as raw observations.
- Split sandbox provisioning, operation ownership, dispatch, attachment, conversation storage and recovery into dedicated services.
- Separate campaign planning, issue execution and integration; isolate workflow state, retries and scheduling.
- Isolate container planning, mounts, commands and transfers, cloud command/file adapters, Git worktree management and remote synchronization stages.
- Extract contracts into `.types.ts` modules and configuration defaults into `.constants.ts` modules, without changing public entry points.
- Enforce dependency boundaries and type placement in CI, reject unused implementation declarations, and document the structure in English and French.

## 1.1.0

- Add typed issue campaigns with dynamic planning, bounded concurrency, per-issue branches, warm review, verified integration and tracker closure.
- Add complete GitHub and Beads backlog connectors and executable campaign starters.
- Isolate cold passes, validate cancellation and structured responses before allocation, and preserve raw/final agent output.
- Expose per-turn transcripts, custom conversation stores, selective path rewriting and separate Claude cache counters.
- Align environment allowlists, caller-relative prompts, interactive variable collection and lifecycle hook ordering.
- Recover managed workspaces, refresh reusable branches and preserve host edits during committed-only remote synchronization.
- Complete Podman namespace options, macOS preflight, file-mount preparation and bounded transfers.
- Add human progress reporting, appendable journals, recovery metadata and terminal cleanup.
- Expand functional, provider and package tests; document migration in English and French.

## 1.0.0

Initial Outpost release.

- Separate workspace and sandbox ownership, reusable environments and asynchronous disposal.
- Codex and Claude Code adapters with native conversations, resume and fork.
- Docker, Podman, host, Vercel and Daytona providers; extensible provider contracts.
- Managed Git worktrees, named branches, automatic integration and recovery files.
- Remote synchronization retaining commit identity and protecting concurrent host changes.
- Prompt files, typed variables, command expansion, completion loops and inactivity deadlines.
- Tagged text/JSON responses, Standard Schema validation and resumable repair attempts.
- Typed workflow graphs with conditions, retries, cancellation, concurrency and diagrams.
- Interactive/headless initialization, five starter templates and issue-tracker connectors.
- English/French documentation, cross-platform tests, coverage gates and package release automation.
