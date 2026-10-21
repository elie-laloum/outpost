---
title: Start here
description: Run one agent task, inspect its result and add a workflow when you need more steps.
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="what-you-can-do-with-outpost"></span>
<span id="run-your-first-task"></span>
<span id="understand-the-building-blocks"></span>
<span id="continue-with-your-own-use-case"></span>

Outpost runs coding agents from your TypeScript code or a YAML recipe. You choose the agent, where it runs and where its changes go. Start with a task whose answer and files you can inspect.

## Get your first result

The recommended path uses Codex in Docker on a Git repository. You need Node.js 24+, Git, Docker and agent access. You can choose other agents and environments later.

<!-- path -->

1. [Install Outpost](../setup/): Install the package, build the image and save your configuration.
2. [Run your first task](../first-request/): Ask for a README review and inspect the answer.
3. [Connect two tasks](../first-workflow/): Pass the agent’s result to your own code.

Prefer a declarative file? After installation, follow [Your first YAML recipe](../yaml-recipes/). A recipe declares the work; a separate local configuration selects the repository, sandbox and credentials.

## Continue in order

Follow these guides in order once your first workflow runs.

<!-- path -->

1. [Run tests on the agent’s changes](../sandbox-sessions/): Keep the agent and your test command in the same environment.
2. [Receive validated data](../typed-responses/): Check a JSON answer before your application uses it.
3. [Save and resume a workflow](../durable-runs/): Resume after a pause or interruption without repeating finished tasks.
4. [Automate your runs](../unattended-runs/): Start work from CI, a queue, a schedule or a webhook.

## Choose your next task

You do not need a complete workflow to use the following guides.

<!-- features -->

- [Review a branch](../git-workspaces/): Keep changes separate and decide when to integrate them.
- [Save a report](../run-reports/): Turn the result into a document for review.
- [Continue a conversation](../conversations/): Send a follow-up without losing the earlier discussion.
- [Recover interrupted work](../recovery/): Inspect what remains before retrying or cleaning up.

## Understand what you control

An **agent** interprets the task. A **sandbox** supplies its execution environment. A **workspace** supplies the files it can work on. [How Outpost runs a task](../how-it-works/) explains their lifetimes.

Instructions such as “run the tests” guide an agent. To require a passing check before accepting changes, run that check in your code with a [verification loop](../verification-loops/) or [checked integration](../integrating-changes/).

The Guide contains tutorials, practical tasks and explanations. The [API](../../reference/) gives exact signatures, options and results. [Complete examples](../fix-failing-ci/) show how to combine the tasks once you need them.
