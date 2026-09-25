---
title: "Cookbooks: from one task to delivery"
description: "Cookbooks: from one task to delivery — Outpost"
sidebar:
  order: 0
---

Each recipe includes a complete script, prerequisites, an expected outcome and failure behavior. Progress from one bounded task to a delivery workflow.

| Level        | Recipe                                                          | Outcome                             |
| ------------ | --------------------------------------------------------------- | ----------------------------------- |
| Light        | [Focused fix](../../cookbook/focused-fix/)                      | A small change on a separate branch |
| Light        | [Typed report](../../cookbook/typed-report/)                    | Validated data for another program  |
| Intermediate | [Codex implements, Claude reviews](../../cookbook/pair-review/) | Two agents sharing a workspace      |
| Intermediate | [Parallel investigations](../../cookbook/parallel/)             | Independent branches and results    |
| Advanced     | [Delivery gates](../../cookbook/delivery-gate/)                 | Tests and review before integration |
| Operations   | [Recovery](../../cookbook/recovery/)                            | Inspect and resume partial work     |

## Shared setup

Use Node.js 24+, a committed Git repository, Docker and the image built by [quick start](../../start/quickstart/). Choose the Podman provider explicitly if needed. Install project tools in that image. Configure [Claude](../../agents/connect-claude/) or [Codex](../../agents/connect-codex/) before running a recipe.

Save an example as **.outpost/recipe.mts** and run **node .outpost/recipe.mts** from the repository root. Agent recipes make real model calls; adapt their budgets and commands. Authentication declarations are read from the repository's **.outpost/.env**, including with named workspaces.

## Ownership

One-shot dispatch closes its sandbox. **await using** closes a reusable sandbox at scope exit. Named branches keep committed work without merging into the host branch. Prompts are instructions, not filesystem permission boundaries. Inspect actual changes and test results. No recipe pushes Git branches automatically.
