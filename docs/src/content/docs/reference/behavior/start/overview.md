---
title: "Outpost documentation"
description: "Outpost documentation — Outpost"
sidebar:
  order: 0
---

Run coding agents in controlled environments, keep their Git work separate, and connect their work with typed workflows.

Outpost is a TypeScript library and a small setup CLI. It supports **Claude Code, Codex and Gemini CLI**, with **Docker, Podman, Vercel, Daytona or explicit host execution**. Agent adapters choose what runs; sandbox providers choose where it runs.

## Choose your next step

| You want to…                             | Start here                                                       |
| ---------------------------------------- | ---------------------------------------------------------------- |
| Run your first agent job                 | [Quick start](../../../../guide/start/quickstart/)               |
| Understand ownership and cleanup         | [Core concepts](../../../../guide/start/concepts/)               |
| Keep an environment running between jobs | [Reusable sandboxes](../../../../guide/environment/lifecycle/)   |
| Coordinate tasks and agents              | [Your first workflow](../../../../guide/workflows/graph/)        |
| Find a specific option or return type    | [API index](../../../)                                           |
| Diagnose a failed run                    | [Troubleshooting](../../../../guide/operations/troubleshooting/) |

## How to use these docs

Guides explain one operation at a time. The API reference lists every public export and its TypeScript contract. Examples use ESM and Node.js 24 or later. Paths such as `run.ts` are relative to your project unless a page says otherwise.

Use the search box for an API name, CLI flag or error. The language selector switches between matching English and French pages. The published site follows the latest release; unreleased source changes are validated by CI before the next release.

[Release history](../../../../project/changelog/) · [Roadmap](../../../../project/roadmap/) · [Source on GitLab](https://gitlab.elielaloum.com/elielaloum/outpost)

Explore the [cookbooks](../../../../guide/cookbook/) for complete recipes, from a focused fix to a validated delivery pipeline.
