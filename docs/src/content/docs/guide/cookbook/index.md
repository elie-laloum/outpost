---
title: Cookbook
description: "Complete recipes, each with its own preparation and observable result."
---

Choose a result you want to obtain. Every recipe starts from a fresh demonstration folder; no previous chapter or shared hidden configuration is required. Code uses public package imports.

## Start small

- [Run a parallel workflow without an agent](./offline/) — Collect three independent checks, then assemble a report after all three complete.
- [Fix a regression on its own branch](./focused-fix/) — Repair the workshop whitespace regression, keep its commits separate, and review before merging.
- [Return a validated defect report](./typed-report/) — Ask an agent to inspect the workshop and turn its answer into data your program can use.

## Combine agents

- [Sequential implementation and review](sequential-review/): start with two explicit calls.
- [Have Codex implement and Claude review](./pair-review/) — Hand the same files from one agent to another, then verify their final state with tests.
- [Investigate independently in parallel](./parallel/) — Inspect whitespace and Unicode handling using separate workspaces and sandboxes.
- [Integrate only after tests and review](./delivery-gate/) — Require tests, a validated review decision and a clean worktree before integrating locally.
- [Continue an investigation and compare an alternative](./conversations/) — Carry context between runs without conflating conversation identity and Git isolation.

## Operate across boundaries

- [Recover unfinished work after failure](./recovery/) — Leave an uncommitted file, fail a test and inspect the retained workspace after closing the sandbox.
- [Coordinate two repositories](./multiple-repositories/) — Pass the first repository’s result into a task operating on another repository.
- [Run the same analysis in a cloud sandbox](./remote/) — Change the execution provider while retaining the chosen agent and its explicit authentication.
- [Run a bounded agent job in CI](./ci/) — Run the same workshop from a manual GitHub Actions job and export patches for review.

## Keep state and decisions

- [Require a human-controlled decision](./human-approval/) — Persist an approval request and submit an explicit local decision.
- [Resume a saved text workflow](./checkpoints/) — Reopen a completed workflow without executing its tasks again.
- [Exchange a versioned contract](./artifacts/) — Publish a validated contract, then read it through a declared dependency.
- [Process text through a durable worker](./workers/) — Run a real SQLite queue, HTTP coordinator and worker together on loopback before separating hosts.

Agent recipes make real model calls; the remote recipe also allocates billable cloud resources. Offline recipes need only Node/npm, with Git where stated. Preparation distinguishes initial installation time from task execution. Named branches keep commits for review; no recipe pushes automatically.
