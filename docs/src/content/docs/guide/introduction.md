---
title: "Start here"
description: "Run a coding agent from TypeScript, then add checks and workflows as you need them."
---

## What you can do with Outpost

Outpost is a TypeScript library for running coding agents on Git repositories. Your code chooses the agent, its execution environment and the branch where it works. The result includes its answer, commits and reported token usage.

Start with a single task. When you need several steps, a workflow connects them and passes their results from one task to the next.

## Run your first task

Follow these three pages in order. They use Docker and Codex to give you a working starting point.

<!-- path -->

1. [Install Outpost](../setup/): Build the image and create your TypeScript configuration.
2. [Your first task](../first-request/): Write a script, read the answer and review a change on its branch.
3. [Create a workflow](../first-workflow/): Connect two tasks and read their results.

## Understand the building blocks

An **agent** does the work, a **sandbox** runs its commands, and a **workspace** is the checkout it edits. You choose these separately. [How Outpost runs a task](../how-it-works/) explains their lifetimes and what happens to the files.

For the exact options and return types of a function, open the [API reference](../../reference/). The guide focuses on how to use those functions together.

## Continue with your own use case

Pick the topic that matches your next step. You can return to the other guides when you need them.

<!-- features -->

- [Write agent instructions](../briefs/): Use text or a reusable Markdown file.
- [Check work and retry](../verification-loops/): Run tests and send failures back for another attempt.
- [Choose an agent](../choose-an-agent/): Configure the agent independently of its sandbox.
- [Reuse a sandbox](../sandbox-sessions/): Run commands and several agent turns on the same files.
- [Wait for approval](../approvals/): Require approval before a later task runs.
- [Run in CI](../ci-automation/): Execute your script in an automated job.

For a complete example, try [fixing a failing build](../fix-failing-ci/) or [building a development workflow](../development-workflow/).
